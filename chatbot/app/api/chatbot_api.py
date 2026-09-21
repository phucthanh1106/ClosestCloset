from fastapi import APIRouter, Depends, HTTPException
from auth.dependencies import get_current_user
from retrieval.retriever import generate_response
from services.redis_memory import save_message, get_messages, create_chat_lock, check_rate_limit, release_chat_lock

chatbot_router = APIRouter()

@chatbot_router.post("/messages")
async def send_prompt(payload: dict, current_user = Depends(get_current_user)):
    session_id = payload.get("sessionId")
    user_message = payload.get("message")
    user_id = current_user

    # Reject empty or oversized messages before calling Gemini or Pinecone
    if not isinstance(user_message, str) or not user_message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    if len(user_message) > 500:
        raise HTTPException(status_code=400, detail="Message cannot exceed 500 characters.")

    # Reject another request if this user already has one running
    lock = await create_chat_lock(user_id)
    if lock:
        raise HTTPException(status_code=429, detail="Please wait for your current message to finish.")

    try:
        # Reject the request when the user's minute or daily limit is reached
        rate_limit_error = await check_rate_limit(user_id, 5, 20)
        if rate_limit_error:
            raise HTTPException(status_code=429, detail=rate_limit_error)
        
        # Generating bot's response based on user's messages and past context
        chat_history = await get_messages(user_id, session_id)
        response = await generate_response(user_message=user_message, namespace=current_user, chat_history=chat_history)

        # Save both messages after generating the response
        await save_message(user_id, session_id, "user", user_message)
        await save_message(user_id, session_id, "assistant", response)

        return {"reply": response}
    finally:
         await release_chat_lock(user_id)



