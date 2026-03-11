# Hard Rules & Guidelines

**Always:**
- Write code that is compatible with Python 3.10+ and Node.js 18+.
- Use TypeScript for new frontend code.
- Add descriptive docstrings to complex Python functions and methods.
- Verify changes after making them (e.g., read files to confirm writes).
- Prioritize testability and modularity.
- Ensure proper error handling and logging, especially in asynchronous tasks (Celery).

**Never:**
- Commit API keys, passwords, or sensitive data.
- Modify build artifacts directly; always edit source files.
- Break existing endpoints without deprecation notices or versioning.
- Use deprecated libraries if modern alternatives are already in the stack.

**When Uncertain:**
- Use the `request_user_input` tool to ask the user for clarification. Do not make assumptions that could dramatically alter the project's scope or architecture without confirmation.
