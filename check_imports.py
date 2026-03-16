try:
    from jose import JWTError, jwt
    from passlib.context import CryptContext
    from fastapi import Depends, HTTPException, status
    from fastapi.security import OAuth2PasswordBearer
    import random
    import httpx
    print("SUCCESS: All imports verified in this environment.")
except ImportError as e:
    print(f"FAILURE: Missing module - {e}")
except Exception as e:
    print(f"ERROR: {e}")
