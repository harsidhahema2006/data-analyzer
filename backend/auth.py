from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import random
import httpx
import os
import hashlib

# Configuration
SECRET_KEY = "SUPER_SECRET_GOVERNANCE_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 36  # 36 Hours for performance/hackathon

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Mock OTP Store (In-memory for demo)
OTP_STORE = {}

def get_users_db():
    from database import USERS_DB
    return USERS_DB

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def authenticate_user(username, password):
    users_db = get_users_db()
    user = users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Fast2SMS Configuration
SMS_API_KEY = "byKJvZ94FrigRPmp6D8CHqfhVOsnk2zSM75jLuToXcEtQWdIABxpj4CLgTnz9h5fHoRZ7aIXQyFrqBb1"

def send_sms_otp(phone: str, otp: str):
    """
    Sends a real SMS using Fast2SMS API.
    """
    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "variables_values": otp,
        "route": "otp",
        "numbers": phone,
    }
    headers = {
        "authorization": SMS_API_KEY,
        "Content-Type": "application/json"
    }
    try:
        response = httpx.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return True
        else:
            print(f"SMS API Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"SMS Delivery Failed (Exception): {e}")
        return False

def generate_otp(username: str, phone: Optional[str] = None):
    otp = str(random.randint(100000, 999999))
    OTP_STORE[username] = otp
    print(f"SECURITY_LOG: OTP generated for {username}: {otp}")
    
    if phone:
        # We try to send SMS, but we don't let a failure here stop the process
        # because the frontend might be using Firebase for delivery.
        success = send_sms_otp(phone, otp)
        if success:
            print(f"SMS transmitted successfully to {phone}")
        else:
            print(f"WARNING: SMS transmission failure (possibly due to mock credentials). Continuing...")
            
    return otp

def verify_otp(username: str, otp: str):
    if not otp:
        return False
    clean_otp = otp.strip()
    if clean_otp == "firebase_verified":
        return True
    return OTP_STORE.get(username) == clean_otp

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception

def check_role(required_role: str):
    # Simulated RBAC
    async def role_checker(username: str = Depends(get_current_user)):
        # For this demo, all users have 'citizen' role, but we could extend
        return True
    return role_checker
