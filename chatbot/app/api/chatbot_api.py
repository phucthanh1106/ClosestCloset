from fastapi import APIRouter, Depends
from auth.dependencies import get_current_user
from retrieval.retriever import generate_response
from services.redis_memory import save_message, get_messages

chatbot_router = APIRouter()

@chatbot_router.post("/messages")
async def send_prompt(payload: dict, current_user = Depends(get_current_user)):
    session_id = payload.get("sessionId")
    user_message = payload.get("message")
    user_id = current_user

    # Generating bot's response based on user's messages and past context
    chat_history = await get_messages(user_id, session_id)

    response = await generate_response(user_message=user_message, namespace=current_user, chat_history=chat_history)

    # Save both messages after generating the response
    await save_message(user_id, session_id, "user", user_message)
    await save_message(user_id, session_id, "assistant", response)

    return {"reply": response}


