import json
import os
import redis.asyncio as redis

# Some configuration for conversation in redis
MAX_MESSAGES = 10
CHAT_TTL_SECONDS = 60 * 30
MAX_MESSAGE_CHARS = 500

# Getting the redis url
REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379"
)

# Initialize the asynchronous Redis client
# Setting decode_responses=True automatically decodes raw Redis bytes into clean UTF-8 Python strings
redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)


def get_chat_key(user_id: str, session_id: str):
    """
    Generates a standardized, unique Redis cache key for a specific user chat session.
    """
    return f"chat:{user_id}:session:{session_id}"


async def save_message(user_id: str, session_id: str, role: str, content: str):
    """Appends a new chat message to the session history in Redis and trims the log.

    This function serializes the message dictionary into a JSON string, pushes it
    to the right side of the Redis list queue, and trims the queue to keep only
    the most recent history (up to MAX_MESSAGES) to preserve memory and token limits.

    Args:
        user_id: The unique identifier of the logged-in user.
        session_id: The unique identifier of the active chat session.
        role: The sender of the message, typically 'user' or 'model' (AI).
        content: The text content of the message.
    """
    key = get_chat_key(user_id, session_id)

    # Limiting length of each message
    if not content:
        content = ""

    content = content[:MAX_MESSAGE_CHARS]

    message = {
        "role": role,
        "content": content
    }

    # json.dumps helps convert a dictionary into a string because redis dont understand dictionary
    # push to the right of the list
    await redis_client.rpush(key, json.dumps(message))

    await redis_client.ltrim(key, -MAX_MESSAGES, -1)

    # Clear the history after 60 minutes
    await redis_client.expire(key, CHAT_TTL_SECONDS)


async def get_messages(user_id: str, session_id: str):
    """Retrieves and reconstructs the full message history for a given chat session.

    This function reads the serialized JSON strings from the Redis list queue
    and parses them back into native Python dictionaries.
    """
    key = get_chat_key(user_id, session_id)

    # 1. Fetch raw JSON string list from Redis
    messages = await redis_client.lrange(key, 0, -1)

    # 2. Convert them back to Python dictionaries
    # json.loads help maps standard JSON data types to their Python counterparts
    return [json.loads(message) for message in messages]


