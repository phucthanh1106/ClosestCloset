# auth/dependencies.py
import os
import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException, status

# Load variables from the .env file into the environment
load_dotenv()

async def get_current_user(authorization: str = Header(None)):
    """
    FastAPI security gatekeeper. Extracts the Bearer JWT token from 
    the incoming headers and decodes it using the shared secret key.
    """
    # 1. Block if the Authorization header is missing entirely
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )

    try:
        # 2. Parse the "Bearer <token>" string format safely
        token_parts = authorization.split(" ")
        if len(token_parts) != 2 or token_parts[0].lower() != "bearer":
            raise ValueError("Malformed authorization header header schema")
            
        token = token_parts[1]

        # 3. Verify and decode the token with your shared MERN secret
        # Uses the default HMAC SHA-256 algorithm (matching jsonwebtoken defaults)
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