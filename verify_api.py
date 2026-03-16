import httpx
import sys
import time

BASE_URL = "http://127.0.0.1:9005"

def test_flow():
    with httpx.Client() as client:
        # 1. Register
        print("Testing Registration...")
        username = f"tester_{int(time.time())}"
        params = {
            "name": "Test User",
            "dob": "1990-01-01",
            "gender": "male",
            "phone": "9876543210",
            "username": username,
            "password": "password123"
        }
        resp = client.post(f"{BASE_URL}/register", json=params)
        if resp.status_code != 200:
            print(f"Registration failed: {resp.text}")
            return
        otp = resp.json()["otp_debug"]
        print(f"Registration successful. OTP: {otp}")

        # 2. Login
        print("Testing Login Stage 1...")
        resp = client.post(f"{BASE_URL}/login", data={"username": username, "password": "password123"})
        if resp.status_code != 200:
            print(f"Login stage 1 failed: {resp.text}")
            return
        otp = resp.json()["otp_debug"]
        print(f"Login stage 1 successful. Login OTP: {otp}")

        # 3. Get Token (OTP Verification)
        print("Testing Token Generation...")
        resp = client.post(f"{BASE_URL}/token", params={"username": username, "otp": otp})
        if resp.status_code != 200:
            print(f"Token generation failed: {resp.text}")
            return
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Token generated successfully.")

        # 4. Search Documents
        print("Testing Document Search...")
        resp = client.get(f"{BASE_URL}/documents", headers=headers, params={"query": "Aadhaar"})
        if resp.status_code != 200:
            print(f"Search failed: {resp.text}")
            return
        docs = resp.json()
        print(f"Search results: {len(docs)} documents found.")

        # 5. Retrieve Document
        print("Testing Document Retrieval...")
        doc_id = docs[0]["id"]
        resp = client.get(f"{BASE_URL}/documents/{doc_id}", headers=headers)
        if resp.status_code != 200:
            print(f"Retrieval failed: {resp.text}")
            return
        print("Retrieval successful.")
        print(f"Secure Payload: {resp.json()['secure_payload'][:20]}...")
        print("Verification PASS.")

if __name__ == "__main__":
    test_flow()
