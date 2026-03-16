import requests
import json

def verify_all():
    login_url = "http://127.0.0.1:9005/login"
    login_data = {"username": "Admin123", "password": "Admin123"}
    try:
        r = requests.post(login_url, data=login_data)
        token = r.json().get("access_token")
        
        docs_url = "http://127.0.0.1:9005/documents"
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(docs_url, headers=headers)
        print(f"API STATUS: {r.status_code}")
        docs = r.json()
        print(f"TOTAL DOCUMENTS FOUND: {len(docs)}")
        for d in docs:
            print(f"FOUND: [{d['department']}] {d['name']}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify_all()
