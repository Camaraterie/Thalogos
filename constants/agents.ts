import { Agent } from '../types';

export const AGENTS: Agent[] = [
    { 
        id: 'product', 
        name: 'Product Manager', 
        description: 'Defines project scope, user stories, and feature prioritization.', 
        keywords: ['plan', 'scope', 'feature', 'priority', 'roadmap', 'user story'],
        avatar: 'PM', 
        color: 'bg-purple-500' 
    },
    { 
        id: 'ui-ux', 
        name: 'UI/UX Specialist', 
        description: 'Designs intuitive and visually appealing user interfaces and workflows.', 
        keywords: ['design', 'ui', 'ux', 'wireframe', 'prototype', 'visuals', 'style'],
        avatar: 'UI', 
        color: 'bg-sky-500' 
    },
    { 
        id: 'backend', 
        name: 'Backend Architect', 
        description: 'Manages server-side logic, databases, and API design.', 
        keywords: ['api', 'database', 'server', 'logic', 'architecture', 'performance', 'security'],
        avatar: 'BE', 
        color: 'bg-emerald-500' 
    },
    { 
        id: 'qa', 
        name: 'QA Engineer', 
        description: 'Specializes in identifying bugs, writing test cases, and ensuring quality.', 
        keywords: ['test', 'bug', 'quality', 'debug', 'validate', 'automation'],
        avatar: 'QA', 
        color: 'bg-amber-500' 
    },
    { 
        id: 'devops', 
        name: 'DevOps Engineer', 
        description: 'Responsible for infrastructure, deployment, CI/CD pipelines, and monitoring.', 
        keywords: ['deploy', 'server', 'pipeline', 'infrastructure', 'monitor', 'ci/cd'],
        avatar: 'DO', 
        color: 'bg-rose-500' 
    },
    { 
        id: 'docs', 
        name: 'Technical Writer', 
        description: 'Creates clear and concise documentation for code, APIs, and user guides.', 
        keywords: ['documentation', 'docs', 'guide', 'api docs', 'tutorial', 'readme'],
        avatar: 'TW', 
        color: 'bg-slate-500' 
    },
    { 
        id: 'codex-specialist', 
        name: 'Coding Specialist (Codex)', 
        description: 'Expert in generating, refactoring, and debugging code across multiple languages.', 
        keywords: ['code', 'script', 'function', 'algorithm', 'debug', 'refactor', 'codex'],
        avatar: 'CDX', 
        color: 'bg-green-400' 
    },
    { 
        id: 'claude-specialist', 
        name: 'Writing Specialist (Claude)', 
        description: 'Expert in creative writing, summarization, and generating long-form text content.', 
        keywords: ['write', 'text', 'summarize', 'content', 'creative', 'prose', 'claude'],
        avatar: 'CLD', 
        color: 'bg-orange-400' 
    },
];