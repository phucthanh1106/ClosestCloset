import os
from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from dotenv import load_dotenv
from typing import List, Dict, Optional
import json


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
            pc = Pinecone(api_key=self.api_key)
            self._index = pc.Index(self.index_name)
        except Exception as e:
            print(f"Error connecting to Pinecone: {e}")
            self._index = None

    def query_index(self, vector: List[float], namespace: str, top_k: int = 3):
        """Query the Pinecone index and return list of metadata+text.

        Returns a list of dicts: {id, score, metadata, text}
        """
        if not self._index:
            return []

        try:
            response = self._index.query(vector=vector, top_k=top_k, include_metadata=True, namespace=namespace)
            matches = response.matches or []
            results = []
            for m in matches:
                match_id = m.id
                match_score = m.score
                
                # Safely handle metadata if it exists as an object property
                metadata = getattr(m, 'metadata', {}) or {}

                results.append({
                    "id": match_id,
                    "score": match_score,
                    "metadata": metadata,
                })
            
            return results
        except Exception as e:
            print(f"Error querying Pinecone index: {e}")
            return []


def embed_text(text: str) -> Optional[List[float]]:
    """Return an embedding vector for `text` if an embeddings provider is present.

    Falls back to None.
    """
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-2",
            output_dimensionality=512
        )
        vector_values = embeddings.embed_query(text)
        return vector_values
    except Exception:
        print("Error embedding the user's message")
        return None
    return None


def build_prompt(user_message: str, contexts: List[Dict]) -> str:
    """Construct the assistant prompt using the user message and retrieved contexts."""
    # New template: concise, user-focused, instructive for the closet assistant
    header = (
        "You are ClosestCloset — a succinct assistant that helps users manage and query their personal wardrobe data.\\n"
        "Guidelines:\\n"
        "- Use only the provided context snippets below when answering.\\n"
        "- Keep answers short (1-3 sentences) and suggest one clear next action when helpful.\\n"
        "- When referring to items, include category and a single-line reason.\\n\\n"
    )

    context_lines = []
    for i, context in enumerate(contexts, start=1):
        meta = context.get("metadata")
        id = meta.get("id") 
        text = meta.get("text") or context.get("text")
        context_lines.append(f"[{i}] id:{id} — {text}")

    context_block = "\\n".join(context_lines) if context_lines else "(no context available)"

    prompt = (
        f"{header}Context snippets:\\n{context_block}\\n\\nUser message:\\n{user_message}\\n\\nAssistant:\\n"
    )
    return prompt


def generate_response(user_message: str, namespace: str, top_k: int = 3) -> str:
    """Main entry: retrieve relevant contexts and generate a short reply.

    Best-effort: uses Pinecone + Google embeddings for retrieval and OpenAI
    ChatCompletion for generation. If model calls are not available, returns the
    assembled prompt so you can inspect it.
    """
    retriever = Retriever()
    # embed the user message
    vector = embed_text(user_message)
    contexts = []
    if vector and retriever._index:
        contexts = retriever.query_index(vector, namespace=namespace, top_k=top_k)
    print(contexts)

    prompt = build_prompt(user_message, contexts)

    # Try OpenAI ChatCompletion as the generator (fallback to returning prompt)
    try:
        # 1. Initialize model properties
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite", # Production standard text generation model
            temperature=0.2,
            max_output_tokens=512
        )
        
        # 2. Fire the invocation text string
        response = llm.invoke(prompt)
        
        # 3. Extract content directly from LangChain's response object
        return response.content.strip()
        
    except Exception as e:
        print(f"Generation failed: {e}")
        # If generation isn't possible, return the assembled prompt for debugging
        return prompt


if __name__ == "__main__":
    import sys
    msg = "\\n".join(sys.argv[1:]) if len(sys.argv) > 1 else "Hello, what's in my closet?"
    out = generate_response(msg)
    print(out)
