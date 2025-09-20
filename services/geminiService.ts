import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Type } from "@google/genai";
import type { Message, Agent } from '../types';
import { AGENTS } from '../constants/agents';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const NEW_SYSTEM_INSTRUCTION = `You are "Guide", a world-class AI orchestrator and lead developer in a shared workspace with a user.

Your primary role is to understand the user's goal and coordinate a team of specialized AI agents to achieve it. You are the sole point of contact for the user.

**AVAILABLE SPECIALIST AGENTS:**
You have a team of specialists at your disposal. You must delegate tasks to them based on their expertise. The available agents are:
- **Product Manager**: For planning, scope, and feature definition.
- **UI/UX Specialist**: For design, layout, and user experience.
- **Backend Architect**: For APIs, databases, and server-side logic.
- **QA Engineer**: For testing, bug detection, and quality assurance.
- **DevOps Engineer**: For deployment, infrastructure, and CI/CD.
- **Technical Writer**: For documentation.
- **Coding Specialist (like Codex)**: An expert in writing, refactoring, and debugging code in any language.
- **Writing Specialist (like Claude)**: An expert in creative writing, summarization, and generating human-like text.

**ORCHESTRATION WORKFLOW:**
1.  **Analyze**: Understand the user's request.
2.  **Delegate**: Determine which specialist is best suited for the task. You can delegate to multiple agents if needed.
3.  **Format Delegation**: When you delegate, you MUST use the format: \`[Delegating to <Agent Name>]: <Your instruction to the agent>.\`
4.  **Synthesize**: After delegating, seamlessly integrate the specialist's (hypothetical) response into your answer to the user. Present their output as if they have already responded to you. Do not say "I will ask them". Assume they have already done the work.
5.  **Be the Spokesperson**: All communication flows through you. The user only talks to you, and you present the collective work of the team.

**EXAMPLE INTERACTION:**
User: "Can you write a python function to fetch data from an API and then explain how to deploy it on a server?"
Your Response:
Excellent plan. I'll get the team on it right away.

[Delegating to Coding Specialist]: Please write a Python function that takes a URL as input, fetches JSON data from it using the 'requests' library, and returns the data. Include error handling.
[Delegating to DevOps Engineer]: Please provide a summary of the steps to deploy a Python script on a Linux server using Gunicorn and Nginx.

Here is the Python function from our Coding Specialist:
\`\`\`python
import requests

def fetch_api_data(url):
    """
    Fetches JSON data from a given API URL.
    
    Args:
        url (str): The URL of the API endpoint.
        
    Returns:
        dict: The JSON data as a Python dictionary, or None if an error occurs.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

# Example usage:
# data = fetch_api_data("https://api.example.com/data")
# if data:
#     print(data)
\`\`\`

And here are the deployment steps from our DevOps Engineer:
1.  **Server Setup**: Ensure your Linux server has Python, pip, Gunicorn, and Nginx installed.
2.  **Upload Your Script**: Transfer your Python script to the server.
3.  **Gunicorn**: Run your script as a web service using Gunicorn.
4.  **Nginx**: Configure Nginx as a reverse proxy to manage incoming traffic and direct it to Gunicorn.

Let me know if you'd like a deeper dive into any of these steps!

**Constraints**:
- You MUST follow the delegation format strictly.
- When the user provides code context, use it.
- Keep your tone professional, encouraging, and clear.
`;

export async function getGuideResponse(userMessage: string, history: Message[], codeContext: string | null, activeAgentIds: string[]): Promise<string> {
    const chatHistory = history.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    const tools = [{ googleSearch: {} }];

    let fullUserMessage = userMessage;
    if (codeContext) {
        fullUserMessage += `\n\n---\n\n**Current Code Context:**\n\`\`\`\n${codeContext}\n\`\`\``;
    }
    
    // The activeAgentIds are now part of the core prompt's specialist list, 
    // so we don't need to dynamically add them here anymore. The Orchestrator is aware of all specialists.
    const systemInstruction = NEW_SYSTEM_INSTRUCTION;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using flash for faster orchestration logic
            contents: [
                ...chatHistory,
                { role: 'user', parts: [{ text: fullUserMessage }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                ],
                // Tools are temporarily disabled to ensure the model focuses on the orchestration format.
                // Re-enable if search grounding is needed alongside orchestration.
                // tools, 
            }
        });

        return response.text ?? "I'm sorry, an empty response was received. Please try again.";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "I'm sorry, I'm having trouble processing that right now. Could you please try again?";
    }
}

export async function selectActiveAgents(goal: string, agents: Agent[]): Promise<string[]> {
    try {
        const agentDescriptions = agents.map(agent => {
            const keywords = agent.keywords ? ` Keywords: ${agent.keywords.join(', ')}` : '';
            return `- ${agent.name} (id: ${agent.id}): ${agent.description}${keywords}`;
        }).join('\n');

        const prompt = `Based on the user's goal, select the most relevant AI agents to have on standby. Your selection should be based on the agent descriptions. The "Coding Specialist" and "Writing Specialist" are very powerful and should be considered for relevant tasks.
        
User Goal: "${goal}"
        
Available Agents:
${agentDescriptions}
        
Analyze the goal and determine which agents' skills are required. Return a JSON object containing a single key "agentIds", which is an array of the string IDs for the selected agents. For example: { "agentIds": ["ui-ux", "codex-specialist"] }.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        agentIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["agentIds"]
                },
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result && Array.isArray(result.agentIds)) {
            const validAgentIds = agents.map(a => a.id);
            return result.agentIds.filter((id: string) => validAgentIds.includes(id));
        }

        console.error("Agent selection returned invalid data:", result);
        return [];
    } catch (error) {
        console.error("Gemini agent selection failed:", error);
        return ['product', 'ui-ux'].filter(id => agents.some(a => a.id === id));
    }
}

export async function detectIntent(userInput: string, agents: Agent[]): Promise<string[]> {
    try {
        const agentDescriptions = agents.map(agent => {
            const keywords = agent.keywords ? ` Keywords: ${agent.keywords.join(', ')}` : '';
            return `Agent Name: ${agent.name}\nAgent ID: ${agent.id}\nDescription: ${agent.description}${keywords}`;
        }).join('\n---\n');

        const systemPrompt = `You are an expert AI orchestrator. Your task is to analyze user input and identify which specialist AI agents could be helpful.
Below are the available agents and their capabilities:
${agentDescriptions}

Based on the user's input, suggest a list of agent IDs that are best suited to address it.
Provide your response in JSON format, containing a single key "agentIds", which is an array of the string IDs for the suggested agents.
If no specific agent is highly suitable, suggest an empty array.`;
        
        const userQuery = `User Input: "${userInput}"\nJSON Response:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\n${userQuery}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        agentIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["agentIds"]
                },
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result && Array.isArray(result.agentIds)) {
            const validAgentIds = agents.map(a => a.id);
            return result.agentIds.filter((id: string) => validAgentIds.includes(id));
        }

        console.error("Intent detection returned invalid data:", result);
        return [];
    } catch (error) {
        console.error("Gemini intent detection failed:", error);
        return [];
    }
}


export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    try {
        const audioPart = {
            inlineData: {
                mimeType,
                data: base64Audio,
            },
        };
        const textPart = {
            text: "Transcribe the following audio recording exactly as spoken, without adding any commentary or introductory phrases.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        const transcribedText = response.text;

        if (transcribedText) {
            return transcribedText.trim();
        }
        
        console.error("Gemini transcription returned no text. The response might have been blocked or was empty.", response);
        throw new Error("Transcription result was empty.");
    } catch (error) {
        console.error("Gemini API call for transcription failed:", error);
        throw new Error("Failed to transcribe audio via Gemini API.");
    }
}