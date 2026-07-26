# auth/dependencies.py
import os
import jwt
from dotenv import load_dotenv
from fastapi import Cookie, HTTPException, status

# Load variables from the .env file into the environment
load_dotenv()

async def get_current_user(token: str | None = Cookie(default=None)):
    """
    FastAPI security gatekeeper. Extracts the Bearer JWT token from 
    the incoming headers and decodes it using the shared secret key.
    """
    # 1. Block if the token is missing entirely
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        # 2. Verify and decode the token with your shared MERN secret
        payload = jwt.decode(
            token, 
            os.environ.get("SECRET"), 
            algorithms=["HS256"]
        )

        # 4. Extract the user identity key (Node.js usually encodes it into '_id')
        user_id = payload.get("_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token footprint layout"
            )

        # Success: Pass the verified ID straight into your endpoint router variable
        return user_id

    except (ValueError, jwt.ExpiredSignatureError, jwt.InvalidTokenError) as error:
        print(f"Auth gatekeeper caught invalid token signature: {error}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Request is not authorized"
        )