from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

model = OllamaLLM(model="llama2")

template = """
You are a helpful assistant that assists the user with code in all possible programming languages.

Here are some examples of how you can help the user: {examples}

Here is the question from the user: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model
def main():
    while True:
        print("Welcome to the coding assistant!")
        question = input("Ask your question (q to quit): ")
        print("\n\n----------------------------------\n\n")
        if question.lower() == "q":
            break
        result = chain.invoke({"examples": [], "question": question})
        print(result)

if __name__ == "__main__":
    main()
