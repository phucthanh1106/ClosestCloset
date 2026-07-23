from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.chatbot_api import chatbot_router

app = FastAPI()

# Configure CORS safety gates
origins = [
    "http://localhost:5173",  # Your React development port
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(chatbot_router, prefix="/chatbot-api")



