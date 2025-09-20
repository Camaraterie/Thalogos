import React from 'react';

export const ReadmeView: React.FC = () => {
  return (
    <div className="flex-grow p-4 overflow-y-auto text-slate-300 prose prose-sm prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-slate-100 prose-a:text-indigo-400">
        <h2 className="text-lg font-bold">About This Project</h2>
        <p>
            Thalamus is a frontend-only React application that serves as a platform for orchestrating multiple AI agents to collaboratively work on user-defined goals. It features a dynamic, modular UI where users can interact with a lead AI guide, manage a team of specialist agents, and use tools like a persistent code editor.
        </p>

        <h3 className="text-md font-semibold mt-4">Simulated Orchestration</h3>
        <p>
            The key feature of this application is its **simulated multi-agent orchestration**. The lead AI, "Guide," has been programmed to act as an orchestrator. It analyzes your requests and delegates tasks to a conceptual team of specialists, including a <strong>Coding Specialist (like Codex)</strong> and a <strong>Writing Specialist (like Claude)</strong>.
        </p>
        <p>
            You will see this delegation happen in the chat. For example:
        </p>
        <pre className="bg-slate-900/70 p-2 rounded-md text-xs">
            <code>
{`[Delegating to Coding Specialist]: Please write a Python function...`}
            </code>
        </pre>
        <p>
            This entire workflow is simulated within a single API call to a powerful large language model (Google's Gemini). It provides a realistic and powerful demonstration of how a true multi-agent system would function.
        </p>

        <h3 className="text-md font-semibold mt-4">How to Run</h3>
        <p>
            This is a frontend application and requires a local web server to run correctly.
        </p>
        <ol>
            <li><strong>Set Environment Variable:</strong> The application requires a Google Gemini API key to be set in an environment variable named <code>API_KEY</code>. Your execution environment must handle this.</li>
            <li>
                <strong>Serve Files:</strong> Use a simple local web server to serve the project directory. A common tool for this is Node's <code>serve</code> package. Open your terminal in the project directory and run:
                <pre className="bg-slate-900/70 p-2 rounded-md text-xs my-2">
                    <code>
{`# Install the serve package globally (only needs to be done once)
npm install -g serve

# Serve the current directory
serve .`}
                    </code>
                </pre>
            </li>
            <li><strong>Access in Browser:</strong> Open your browser to the local server's address (e.g., <code>http://localhost:3000</code>).</li>
        </ol>

        <h3 className="text-md font-semibold mt-4">Future Development: True Orchestration</h3>
        <p>
            To evolve this into a true multi-model system, a backend server is required. This server would:
        </p>
        <ul>
            <li>Securely manage API keys for various services (Google, OpenAI, Anthropic).</li>
            <li>Receive requests from the frontend.</li>
            <li>Make real API calls to the specialist models (Codex, Claude, etc.) based on the Guide's delegation decisions.</li>
            <li>Synthesize the results and return them to the user.</li>
        </ul>

        <h4 className="text-base font-semibold mt-3">Backend API Structure</h4>
        <p>
            A potential backend API endpoint for this orchestration layer could look like this:
        </p>
        <p>
            <strong>Endpoint:</strong> <code>POST /api/v1/chat</code>
        </p>
        <p>
            <strong>Body:</strong>
        </p>
        <pre className="bg-slate-900/70 p-2 rounded-md text-xs">
            <code>
{`{
  "message": "User's current message.",
  "history": [ ...chat history ],
  "activeAgents": [ "id-1", "id-2" ],
  "codeContext": "..."
}`}
            </code>
        </pre>
        <p>
            The backend would then handle the full orchestration logic and stream back the final, synthesized response from the Guide AI.
        </p>

        <p>
            This current version provides the complete user-facing experience and a solid foundation for building that backend logic.
        </p>
    </div>
  );
};