
import { useState, useRef, useCallback, useEffect } from 'react';
import { useErrorLogger } from '../contexts/ErrorContext';
import { transcribeAudio } from '../services/geminiService';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string)?.split(',')[1];
            if (base64String) {
                resolve(base64String);
            } else {
                reject(new Error("Failed to convert blob to base64."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

export type RecognitionStatus = 'idle' | 'recording' | 'transcribing' | 'error';

interface SpeechRecognitionHookProps {
    onTranscriptReady: (transcript: string) => void;
}

export interface SpeechRecognitionHook {
    recognitionStatus: RecognitionStatus;
    startListening: () => void;
    stopListening: () => void;
    hasRecognitionSupport: boolean;
    error: string | null;
}

export const useSpeechRecognition = ({ onTranscriptReady }: SpeechRecognitionHookProps): SpeechRecognitionHook => {
    const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const { logError } = useErrorLogger();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const silenceTimeoutRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const errorTimeoutRef = useRef<number | null>(null);
    
    const hasRecognitionSupport = typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof window.MediaRecorder === 'function';

    const stopRecordingAndTranscribe = useCallback(async () => {
        if (audioChunksRef.current.length === 0) {
            logError("No audio chunks recorded, stopping.");
            setRecognitionStatus('idle');
            return;
        }

        setRecognitionStatus('transcribing');
        setError(null);
        logError("Starting transcription...");

        try {
            const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            audioChunksRef.current = [];
            
            const base64Audio = await blobToBase64(audioBlob);
            const transcribedText = await transcribeAudio(base64Audio, mimeType);
            
            if (transcribedText) {
                onTranscriptReady(transcribedText);
            }
            logError("Transcription successful.", { transcribedText });
            setRecognitionStatus('idle');
        } catch (err: any) {
            const errorMessage = "Sorry, I couldn't understand that. Please try again.";
            console.error("Transcription failed:", err);
            logError("Transcription failed", err);
            setError(errorMessage);
            setRecognitionStatus('error');
            
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = window.setTimeout(() => {
                setError(null)
                setRecognitionStatus('idle')
            }, 5000);
        }
    }, [logError, onTranscriptReady]);

    const cleanup = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
            audioContextRef.current = null;
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
    }, []);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            logError("Stopping recording.");
            mediaRecorderRef.current.stop(); // Triggers 'stop' event which calls stopRecordingAndTranscribe
            cleanup();
        }
    }, [cleanup, logError]);
    
    const detectSilence = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) {
            rafRef.current = requestAnimationFrame(detectSilence);
            return;
        };
        
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        let sum = 0.0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += Math.abs(dataArrayRef.current[i] / 128.0 - 1.0);
        }
        const volume = sum / dataArrayRef.current.length;

        if (volume > 0.02) { // Speaking threshold
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = null;
            }
        } else { // Silence
            if (!silenceTimeoutRef.current) {
                silenceTimeoutRef.current = window.setTimeout(() => {
                    logError("Silence detected, stopping listening.");
                    stopListening();
                }, 1200); // 1.2 seconds of silence
            }
        }
        
        rafRef.current = requestAnimationFrame(detectSilence);
    }, [stopListening, logError]);


    const startListening = useCallback(async () => {
        if (recognitionStatus !== 'idle' || !hasRecognitionSupport) {
            logError("Cannot start listening.", { status: recognitionStatus, support: hasRecognitionSupport });
            return;
        }

        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const options = { mimeType: 'audio/webm' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });
            mediaRecorder.addEventListener('stop', stopRecordingAndTranscribe);
            
            const context = new AudioContext();
            audioContextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            sourceRef.current = source;
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);

            mediaRecorder.start();
            setRecognitionStatus('recording');
            rafRef.current = requestAnimationFrame(detectSilence);
            logError("Started recording with silence detection.");

        } catch (err: any) {
            let errorMessage = "An unexpected error occurred.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = "Microphone access denied. Please enable it in your browser settings.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                 errorMessage = "No microphone found. Please connect a microphone and try again.";
            }
            console.error("Error starting recording:", err);
            logError("Error starting recording", err);
            setError(errorMessage);
            setRecognitionStatus('error');
        }
    }, [recognitionStatus, hasRecognitionSupport, logError, stopRecordingAndTranscribe, detectSilence]);
    
    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            cleanup();
        };
    }, [cleanup]);

    return {
        recognitionStatus,
        startListening,
        stopListening,
        hasRecognitionSupport,
        error,
    };
};