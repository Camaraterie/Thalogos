# Thalamus: Agent Orchestration Platform

Thalamus is a frontend-only React application that serves as a platform for orchestrating multiple AI agents to collaboratively work on user-defined goals. It features a dynamic, modular UI where users can interact with a lead AI guide, manage a team of specialist agents, and use tools like a persistent code editor.

This project is designed to run in a secure environment where the API key is provided as an environment variable.

## Key Features

*   **Goal-Oriented Sessions**: Start a session by defining a high-level goal.
*   **Dynamic Agent Assembly**: An AI analyzes your goal to automatically select and activate the most relevant specialist agents for the task.
*   **Simulated Multi-Agent Orchestration**: The lead AI guide ("Guide") simulates a true orchestration workflow by delegating tasks to a team of conceptual specialists (like code and writing experts) and integrating their responses.
*   **Interactive UI**: A modular interface with draggable and resizable windows for chat, code editing, and ideation.
*   **Persistent State**: Your chat history and code editor content are saved to `localStorage`, allowing you to continue your session even after a page reload.
*   **Real-time Intent Detection**: As you chat, the platform can suggest activating other agents based on the content of your messages.

## How to Run This Application

This is a frontend-only application built with React and TypeScript. It can be run by serving the static files (`index.html`, etc.) from any simple web server.

**Prerequisites:**
*   A modern web browser.
*   A valid Google Gemini API key.

**Execution Steps:**

1.  **Set Up the Environment Variable**:
    This application requires a Google Gemini API key to be available as an environment variable named `API_KEY`. The execution environment must handle this. For local development, you can use a tool that injects environment variables.

2.  **Serve the Files**:
    Place all the project files (`index.html`, `index.tsx`, etc.) in a single directory. Use a simple local web server to serve this directory. A common tool for this is `serve`. If you have Node.js installed, you can run:
    ```bash
    # Install the serve package globally (only needs to be done once)
    npm install -g serve

    # Navigate to your project directory in the terminal
    cd path/to/your/project/files

    # Start the server
    serve .
    ```
    This will typically start a server at `http://localhost:3000`.

3.  **Access the Application**:
    Open your web browser and navigate to the address provided by your local server (e.g., `http://localhost:3000`). The application should load and be ready for use.

## Architecture & Future Development

### Current State: Frontend-Only with Simulated Orchestration

The application currently operates entirely in the browser. The "orchestration" between the lead AI Guide and specialist agents (like Codex or Claude) is **simulated**. A single call is made to the Gemini API with a sophisticated system prompt that instructs the model to behave as an orchestrator, formatting its responses to show delegation.

This provides a powerful and realistic demonstration of the desired functionality without the need for a backend.

### Future Vision: True Multi-Model Orchestration

To evolve this into a true multi-model system, a backend service is required. The roadmap is as follows:

1.  **Create a Backend Server** (e.g., using Node.js/Express, Python/FastAPI):
    *   This server will securely store and manage API keys for multiple services (Google Gemini, OpenAI, Anthropic, etc.). **Never expose multiple API keys on the frontend.**
    *   It will expose a single, unified API endpoint for the frontend to communicate with (e.g., `/api/v1/chat`).

2.  **Implement the Orchestration Logic**:
    *   The backend will receive a request from the frontend.
    *   It will use a primary model (like Gemini) to act as the orchestrator, just as it's simulated now.
    *   When the orchestrator model decides to delegate a task (e.g., to "Codex"), the backend will intercept this.
    *   The backend will then make a *real* API call to the appropriate service (e.g., OpenAI's API for a coding task).
    *   The result from the specialist model will be returned to the orchestrator model to synthesize a final response for the user.

3.  **Update the Frontend**:
    *   The frontend will be updated to call the new backend endpoint instead of making direct calls to the Gemini API.

This architecture provides a scalable, secure, and powerful platform for true agentic orchestration.
