from fastapi import APIRouter, Depends
from auth.dependencies import get_current_user
from retriever import generate_response

chatbot_router = APIRouter()


@chatbot_router.post("/messages")
async def send_prompt(payload: dict, current_user = Depends(get_current_user)):
    # print(current_user)
    response = generate_response(payload.get("message"), namespace=current_user)
    print(response)
    return {"reply": response}
