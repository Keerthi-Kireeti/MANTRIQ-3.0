import os
import dotenv
from google import genai
from google.genai import types

dotenv.load_dotenv()

def main():
    print("Welcome to the coding assistant!")
    
    # Initialize the client. The SDK will automatically look for the GEMINI_API_KEY environment variable.
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[!] ERROR: GEMINI_API_KEY environment variable is not set.")
        print("    Please get a free API key from Google AI Studio (aistudio.google.com)")
        print("    and set it in your terminal before running this script.")
        print("    Example: set GEMINI_API_KEY=your_key_here\n")
        return
        
    client = genai.Client(api_key=api_key)
    
    # We create a chat session so the assistant remembers the context of the conversation
    chat = client.chats.create(
        model="gemini-2.5-flash", 
        config=types.GenerateContentConfig(
            system_instruction="You are a helpful coding assistant. You answer programming questions accurately."
        )
    )

    while True:
        question = input("Ask your question (q to quit): ")
        if question.lower() == "q":
            break
            
        print("\n\n----------------------------------\n\n")
        try:
            response = chat.send_message(question)
            print(response.text)
            print("\n")
        except Exception as e:
            print(f"Error communicating with Gemini: {e}\n")

if __name__ == "__main__":
    main()
