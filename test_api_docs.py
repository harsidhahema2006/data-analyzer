import requests

def test_api():
    # Login to get token first
    login_url = "http://127.0.0.1:9005/login"
    login_data = {"username": "Admin123", "password": "Admin123"}
    try:
        r = requests.post(login_url, data=login_data)
        token = r.json().get("access_token")
        
        # Get documents
        docs_url = "http://127.0.0.1:9005/documents"
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(docs_url, headers=headers)
        print(f"Status: {r.status_code}")
        print("Documents found:")
        for doc in r.json():
            print(f"- {doc['name']} ({doc['department']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
