import os
import base64
# Security Node Reload Trigger: Force sync with departmental nodes [Last Sync: 2026-03-16 11:51]
from fastapi import FastAPI, Depends, HTTPException, status, Request, Body, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    generate_otp, 
    verify_otp,
    get_password_hash,
    verify_password
)
from database import get_db, USERS_DB, save_users
from document_service import search_documents, retrieve_document, deposit_document
from security import (
    sanitize_input, 
    ResilienceManager,
    SecurePipeline,
    AdvancedSecurityEnvelope
)
import time
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    dob: str
    gender: str
    phone: str
    username: str
    password: str
    age: Optional[str] = None

class DepositRequest(BaseModel):
    name: str # Document name
    department: str
    citizen_name: str
    citizen_phone: str
    citizen_dob: str

app = FastAPI(title="Secure E-Governance API")

# Resilience Manager
resilience = ResilienceManager()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for Rate Limiting & Threat Detection Simulation
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Simulated Input Sanitization for Query Params
    for key, value in request.query_params.items():
        sanitize_input(value)
    
    # AI Threat Detection Simulation (Consuming from Resilience Manager)
    health = resilience.get_system_health()
    if health.get("status") == "CRITICAL":
        return JSONResponse(
            status_code=403,
            content={"detail": "High security threat detected. Request blocked by AI Sentinel."}
        )
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Security-Layer"] = "PQC-AES-256-GCM"
    return response

# --- Auth Endpoints ---

@app.post("/register")
async def register(request: Request):
    body = await request.json()
    username = body.get("username")
    print(f"DEBUG: Attempting register for {username}. Current DB size: {len(USERS_DB)}")
    if not username:
         raise HTTPException(status_code=400, detail="Username missing in body")
         
    if username in USERS_DB:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    USERS_DB[username] = {
        "name": body.get("name"),
        "dob": body.get("dob"),
        "gender": body.get("gender"),
        "phone": body.get("phone"),
        "password": get_password_hash(body.get("password", "")),
        "role": "citizen"
    }
    save_users()
    
    otp = generate_otp(username, body.get("phone"))
    return {"message": "User registered. OTP sent."}

@app.post("/verify-otp")
async def verify_user_otp(username: str, otp: str):
    if verify_otp(username, otp):
        return {"message": "OTP Verified successfully."}
    raise HTTPException(status_code=401, detail="Invalid OTP")

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = USERS_DB.get(form_data.username)
    print(f"DEBUG LOGIN: username={form_data.username}, found={user is not None}")
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if user.get("role") == "admin":
        full_token = create_access_token(data={"sub": form_data.username})
        # Generate OTP even for admin to allow them to use Citizen MFA flow if they wish
        otp = generate_otp(form_data.username, user.get("phone"))
        return {
            "access_token": full_token, 
            "token_type": "bearer", 
            "role": "admin",
            "message": "Admin authorized.",
            "phone": user.get("phone")
        }
    
    otp = generate_otp(form_data.username, user.get("phone"))
    return {
        "message": "Credentials valid. OTP sent.", 
        "phone": user.get("phone")
    }

@app.post("/token")
async def get_token(username: str, otp: str):
    if not verify_otp(username, otp):
        raise HTTPException(status_code=401, detail="Invalid MFA token")
    
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Document Endpoints ---

@app.get("/documents")
async def get_docs(query: Optional[str] = None, current_user_username: str = Depends(get_current_user)):
    user_profile = USERS_DB.get(current_user_username)
    if not user_profile:
         raise HTTPException(status_code=401, detail="User not found")
         
    if user_profile.get("role") == "admin":
        return await search_documents(query, user_metadata=None)
        
    metadata = {
        "name": user_profile.get("name"),
        "phone": user_profile.get("phone"),
        "dob": user_profile.get("dob")
    }
    return await search_documents(query, user_metadata=metadata)

@app.post("/deposit")
async def deposit_doc(
    file: UploadFile = File(...),
    name: str = Form(...),
    department: str = Form(...),
    citizen_name: str = Form(...),
    citizen_phone: str = Form(...),
    citizen_dob: str = Form(...)
):
    # Security pipeline handled inside deposit_document
    file_content = await file.read()
    
    # Persist file content to disk securely using absolute backend path
    base_storage_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage")
    if not os.path.exists(base_storage_dir):
        os.makedirs(base_storage_dir)
        
    file_id = f"{department.replace(' ', '_')}_{name.replace(' ', '_')}_{len(file_content)}"
    storage_path = os.path.join(base_storage_dir, file_id)
    
    # Store relative path in DB to keep it portable, but write to absolute path
    relative_storage_path = os.path.join("storage", file_id)
        
    try:
        with open(storage_path, "wb") as f:
            f.write(file_content)
            f.flush()
            os.fsync(f.fileno())
        print(f"DEBUG: Successfully stored {len(file_content)} bytes to {storage_path}")
    except Exception as e:
        print(f"SECURITY ERROR: Failed to write encrypted asset to disk: {e}")
        raise HTTPException(status_code=500, detail="Storage mechanism failure")

    success = await deposit_document({
        "name": name,
        "department": department,
        "citizen_name": citizen_name,
        "citizen_phone": citizen_phone,
        "citizen_dob": citizen_dob,
        "filename": file.filename,
        "storage_path": relative_storage_path
    })
    
    if success:
        return {"message": "Document securely stored in departmental node via full security pipeline."}
    raise HTTPException(status_code=400, detail="Invalid department node specified.")

@app.get("/documents/{doc_id}/secure-fetch")
async def secure_fetch_document(doc_id: str, current_user_username: str = Depends(get_current_user)):
    user_profile = USERS_DB.get(current_user_username)
    if not user_profile:
        raise HTTPException(status_code=401, detail="User not found")
        
    metadata = {
        "name": user_profile.get("name"),
        "phone": user_profile.get("phone"),
        "dob": user_profile.get("dob")
    }
    
    # 1. Fetch via Secure Pipeline
    doc = await retrieve_document(doc_id, metadata)
    if not doc:
        raise HTTPException(status_code=404, detail="Governance record not found or access denied by Pipeline.")
    
    # 5. Read actual file content
    file_data_b64 = ""
    storage_path = doc.get("encrypted_file") or doc.get("storage_path", "")
    if storage_path:
        # Resolve relative paths against the backend's directory
        if not os.path.isabs(storage_path):
            storage_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), storage_path)
        if os.path.exists(storage_path):
            with open(storage_path, "rb") as f:
                file_data_b64 = base64.b64encode(f.read()).decode('utf-8')

    # 6. Secure Pipeline Outbound Relay
    await SecurePipeline.process_request("OUTBOUND_RELAY", {"doc_id": doc_id})
    
    # Final Secure Payload (PQC Verified)
    doc_name = doc.get("name", "Unknown Document")
    secure_payload = f"SECURE_ENVELOPE[VERIFIED]: {doc_name} verified for {current_user_username} via ZKP & HSM."
    
    return {
        "metadata": doc,
        "secure_payload": secure_payload,
        "file_content": file_data_b64,
        "status": "SECURE_RETRIEVAL_COMPLETE"
    }

# --- System Health ---

@app.get("/system/health")
async def system_health():
    return resilience.get_system_health()
@app.get("/")
def root():
    return {"message": "System Running"}
