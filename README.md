# 🔐 FastAPI Authentication API

A secure and scalable **REST API backend** built with **FastAPI** and **Python**, featuring JWT-based authentication, password hashing, and full user management.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python web framework |
| **Uvicorn** | Lightning-fast ASGI server |
| **Python-Jose** | JWT token generation & verification |
| **Passlib (bcrypt)** | Secure password hashing |
| **Pydantic** | Data validation & serialization |
| **Pydantic-Settings** | Environment-based configuration |
| **HTTPX** | Async HTTP client |
| **Python-Multipart** | File/form data handling |

---

## ✨ Features

- ✅ User Registration & Login
- ✅ JWT Access Token Authentication
- ✅ Secure Password Hashing with bcrypt
- ✅ Protected API Routes
- ✅ Request Validation with Pydantic
- ✅ Environment-based Configuration
- ✅ Auto-generated Swagger API Docs

---

## 📁 Project Structure

```
hack/
├── main.py              # App entry point
├── routers/
│   ├── auth.py          # Login & register routes
│   └── users.py         # User management routes
├── models/
│   └── user.py          # User data models
├── schemas/
│   └── token.py         # JWT token schemas
├── core/
│   ├── security.py      # Password hashing & JWT logic
│   └── config.py        # App configuration settings
├── requirements.txt     # Project dependencies
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/harsidhahema2006/hack.git
cd hack
```

### 2. Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Run the Server
```bash
uvicorn main:app --reload
```

The API will be running at: **http://localhost:8000**

---

## 📖 API Documentation

Once the server is running, visit:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login & get JWT token | ❌ |
| GET | `/users/me` | Get current user profile | ✅ |
| PUT | `/users/me` | Update user profile | ✅ |

---

## 🧪 Sample API Usage

### Register a User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "harsidha", "email": "harsidha@example.com", "password": "securepassword"}'
```

### Login & Get Token
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=harsidha&password=securepassword"
```

### Access Protected Route
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 🛡️ Security

- Passwords are hashed using **bcrypt** — never stored as plain text
- Authentication uses **JWT tokens** with expiry
- Sensitive config values stored in **environment variables**
- Input validated using **Pydantic schemas**

---

## 📌 Requirements

```
fastapi==0.115.8
uvicorn[standard]==0.34.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.28.1
python-multipart==0.0.20
pydantic-settings==2.7.1
pydantic==2.10.6
```

---

## 👩‍💻 Author

**Harsidha Ganapathi**
- GitHub: [@harsidhahema2006](https://github.com/harsidhahema2006)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
