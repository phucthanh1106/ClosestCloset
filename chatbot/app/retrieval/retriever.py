import os
from pinecone import Pinecone
from pinecone.grpc import PineconeGRPC
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from dotenv import load_dotenv
from typing import List, Dict, Optional
import asyncio

# Load variables from the .env file into the environment
load_dotenv()

# Config
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class Retriever:
    def __init__(self, index_name: Optional[str] = None, api_key: Optional[str] = None):
        self.index_name = index_name or PINECONE_INDEX_NAME
        self.api_key = api_key or PINECONE_API_KEY
        self._index = None

        try:
            pc = PineconeGRPC(api_key=self.api_key)
            self._index = pc.Index(self.index_name)
        except Exception as e:
            print(f"Error connecting to Pinecone: {e}")
            self._index = None

    async def query_index(self, vector: List[float], namespace: str, top_k: int = 3):
        """Query the Pinecone index and return list of metadata+text.

        Returns a list of dicts: {id, score, metadata, text}
        """
        if not self._index:
            return []

        try:
            # Run the synchronous index.query in a separate thread!
            response = await self._index.query(vector=vector, top_k=top_k, include_metadata=True, namespace=namespace)
            matches = response.matches or []
            results = []
            for m in matches:
                match_id = m.id
                match_score = m.score
                
                # Safely handle metadata if it exists as an object property
                metadata = getattr(m, 'metadata', {}) or {}

                results.append({
                    "id": str(match_id),
                    "score": match_score,
                    "metadata": metadata,
                })
            
            return results
        except Exception as e:
            print(f"Error querying Pinecone index: {e}")
            return []


async def embed_text(text: str) -> Optional[List[float]]:
    """Return an embedding vector for `text` if an embeddings provider is present.

    Falls back to None.
    """
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-2",
            output_dimensionality=512 # a numerical vector consisting of exactly 512 features or numbers
        )
        vector_values = await embeddings.aembed_query(text)
        return vector_values
    except Exception:
        print("Error embedding the user's message")
        return None
    return None


def build_prompt(user_message: str, contexts: List[Dict], chat_history: List[Dict]) -> str:
    """Construct the assistant prompt using the user message and retrieved contexts."""
    # New template: concise, user-focused, instructive for the closet assistant
    header = (
        "You are Closest Chatbot — a wardrobe assistant that helps users manage and query things about their personal wardrobe data.\n"
        "RULES:\n"
        "- Use only the provided context snippets below when answering.\n"
        "- Keep answers short (1-3 sentences) and suggest one clear next action when helpful.\n"
        "- You must refer to the latest conversation history (if there is any) to answer user's message in the case when their message contains so little information.\n"
        "- When referring to items, include category and a single-line reason.\n"
    )

    # Getting the context from pinecone
    context_lines = []
    for i, context in enumerate(contexts, start=1):
        meta = context.get("metadata")
        id = context.get("id") 
        text = meta.get("text") or context.get("text")
        context_lines.append(f"[{i}] id:{id} — {text}")

    context_block = "\n".join(context_lines) if context_lines else "(no context available)"

    # Getting the past history session of the user
    history_lines = []
    for message in chat_history:
        role = message.get("role")
        content = message.get("content")
        history_lines.append(f"{role}: {content}")

    history_block = "\n".join(history_lines) if history_lines else "(no chat history yet)"

    prompt = (
            f"{header}Item contexts:\n{context_block}\n\n"
            f"Latest chat history:\n{history_block}\n\n"
            f"User message:\n{user_message}\n\n"
            f"Assistant:\n"
        )
    
    return prompt


async def generate_response(user_message: str, namespace: str, chat_history: List[Dict], top_k: int = 5) -> str:
    """Main entry: retrieve relevant contexts and generate a short reply.
    """
    retriever = Retriever()

    # Constructing recent messages in the conversation
    past_messages = ""
    recent_messages = chat_history[-2:] # Only get the last 2 messages

    for message in recent_messages:
        role = message.get("role")
        content = message.get("content")
        past_messages += f"{role}: {content}\n"

    past_messages += f"user: {user_message}"

    # Embed the user message + the chat history 
    # QUERY contexts
    vector = await embed_text(past_messages)
    contexts = []
    if vector and retriever._index:
        contexts = await retriever.query_index(vector, namespace=namespace, top_k=top_k)

    prompt = build_prompt(user_message, contexts, chat_history)
    print(prompt)

    try:
        # Initialize model properties
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite", 
            temperature=0.2,
            max_output_tokens=512
        )
        
        # Fire the invocation text string
        response = await llm.ainvoke(prompt)
        
        # Extract content directly from LangChain's response object
        return response.content.strip()
        
    except Exception as e:
        print(f"Generation failed: {e}")
        return f"Sorry, I have encountered an error! Please try again or contact the owner of the website if you know him!"


if __name__ == "__main__":
    import sys
    msg = "\\n".join(sys.argv[1:]) if len(sys.argv) > 1 else "Hello, what's in my closet?"
    out = generate_response(msg)
    print(out)
