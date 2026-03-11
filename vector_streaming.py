import sys
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

model = OllamaLLM(model="llama2")

template = """
You are MANTRIQ 2.0, a friendly and brilliant AI Code Assistant. Your goal is to provide simple, effective, and accurate answers to help developers with their coding tasks. 

Your Persona:
- You are helpful, encouraging, and a little bit witty.
- You love to help developers write better code.
- You are an expert in all programming languages and software development concepts.

Instructions for the current mode: {mode}
{mode_instructions}

User Input:
{question}

Respond in the following format:
1. **Summary**: A brief, one-sentence summary of the solution.
2. **Code/Explanation**: The code solution or a clear explanation, using markdown for code blocks.
3. **Key Points**: (Optional) Bullet points for important details or best practices.

Keep your answers concise and to the point. Focus on providing practical, production-ready code and explanations.
"""

MODE_INSTRUCTIONS = {
    "explain": "Clearly and concisely explain what the code does, how it works, and why it's written that way. Use analogies if they help clarify complex topics.",
    "debug": "You are a bug fixer. Identify and fix any bugs in the provided code, explaining the changes.",
    "generate": "You are a code generator. Create clean, efficient, and well-documented code based on the user's requirements.",
    "review": "You are a code reviewer. Conduct a thorough review of the provided code, checking for errors, suggesting improvements, and ensuring best practices.",
    "optimize": "You are a code optimizer. Analyze the provided code and suggest specific optimizations to improve performance, readability, and efficiency.",
    "edit": "You are a code editor. Apply the user's changes to the provided code and provide the updated code."
}

# Create the prompt template
def main():
    if len(sys.argv) < 3:
        print("Usage: python vector_streaming.py <mode> <question>")
        sys.exit(1)

    # Normalize mode aliases (e.g., "fix" -> "debug")
    raw_mode = sys.argv[1].lower()
    alias_map = {
        "fix": "debug",
        "explain": "explain",
        "debug": "debug",
        "generate": "generate",
        "review": "review",
        "optimize": "optimize",
        "edit": "edit",
    }
    mode = alias_map.get(raw_mode, "explain")

    # Support questions with spaces by joining remaining args
    question = " ".join(sys.argv[2:])

    prompt = ChatPromptTemplate.from_template(template)
    chain = prompt | model

    try:
        for chunk in chain.stream({
            "mode": mode,
            "mode_instructions": MODE_INSTRUCTIONS.get(mode, ""),
            "question": question
        }):
            print(chunk, end="", flush=True)
    except Exception as e:
        print(f"Error streaming response: {str(e)}", file=sys.stderr)

if __name__ == "__main__":
    main()
