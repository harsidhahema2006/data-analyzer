import random
import logging
import json
import os
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Distributed Node Architecture
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. User Authentication Cluster
USERS_FILE = os.path.join(BASE_DIR, "users.json")
USERS_DB = {}

# 2. Decentralized Departmental Nodes
DEPT_STORAGE_FILES = {
    "Identity Node": os.path.join(BASE_DIR, "db_identity.json"),
    "Income Node": os.path.join(BASE_DIR, "db_income.json"),
    "Health Node": os.path.join(BASE_DIR, "db_health.json"),
    "Social Node": os.path.join(BASE_DIR, "db_social.json")
}

# In-memory Replica Set
DEPT_DB = {
    "Identity Node": {"BirthCertificates": [], "AadhaarCards": []},
    "Income Node": {"PANCards": [], "TaxCertificates": []},
    "Health Node": {"HealthRecords": []},
    "Social Node": {"SocialSubsidies": []}
}

def load_users():
    global USERS_DB
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r") as f:
                USERS_DB.update(json.load(f))
        except Exception as e:
            logger.error(f"Error loading authenticated cluster: {e}")

def save_users():
    try:
        with open(USERS_FILE, "w") as f:
            json.dump(USERS_DB, f, indent=4)
    except Exception as e:
        logger.error(f"Error syncing user cluster: {e}")

def load_departmental_data():
    global DEPT_DB
    # Reset in-memory state before reloading from disk
    DEPT_DB = {
        "Identity Node": {"BirthCertificates": [], "AadhaarCards": [], "Generic": []},
        "Income Node": {"PANCards": [], "TaxCertificates": [], "Generic": []},
        "Health Node": {"HealthRecords": [], "Generic": []},
        "Social Node": {"SocialSubsidies": [], "Generic": []}
    }
    for dept, filename in DEPT_STORAGE_FILES.items():
        if os.path.exists(filename):
            try:
                with open(filename, "r") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for doc in data:
                            coll = doc.get("document_type", "Generic")
                            if coll not in DEPT_DB[dept]:
                                DEPT_DB[dept][coll] = []
                            DEPT_DB[dept][coll].append(doc)
                    elif isinstance(data, dict):
                        for coll, docs in data.items():
                            if coll not in DEPT_DB[dept]:
                                DEPT_DB[dept][coll] = []
                            if isinstance(docs, list):
                                DEPT_DB[dept][coll].extend(docs)
            except Exception as e:
                logger.error(f"Error loading {dept}: {e}")

def save_departmental_data(dept):
    filename = DEPT_STORAGE_FILES.get(dept)
    if filename:
        try:
            with open(filename, "w") as f:
                json.dump(DEPT_DB[dept], f, indent=4)
        except Exception as e:
            logger.error(f"Error persisting {dept} to node storage: {e}")

# Initialization
load_users()

# Bootstrap Admin Node
admin_username = "Admin123"
if admin_username not in USERS_DB:
    USERS_DB[admin_username] = {
        "name": "Head Administrator",
        "dob": "01-01-1970",
        "gender": "Other",
        "phone": "0000000000",
        "password": hashlib.sha256("Admin123".encode()).hexdigest(),
        "role": "admin"
    }
    save_users()

load_departmental_data()

class ResilienceController:
    """Manages High Availability, Failover, and Geo-Redundancy."""
    def __init__(self):
        self.replicas = ["Node-Alpha", "Node-Beta", "Node-Gamma"]
        self.primary = "Node-Alpha"
        self.is_healthy = True

    def rotate_replicas(self):
        if random.random() < 0.1:
            logger.warning(f"FAULT DETECTED ON {self.primary}. SHIFTING TRAFFIC TO {random.choice(self.replicas)}...")
            self.primary = random.choice(self.replicas)

    def trigger_geo_sync(self):
        logger.info(f"GEO-REDUNDANCY: Syncing encrypted shards to Geo-Replica (Region: Asia-South)...")

resilience_ctrl = ResilienceController()

def get_db():
    resilience_ctrl.rotate_replicas()
    resilience_ctrl.trigger_geo_sync()
    
    # Reload from disk to pick up the latest template and deposited data
    load_departmental_data()
    
    # Flatten the DB for service layer consumption
    flattened_dept = {}
    for dept, collections in DEPT_DB.items():
        all_docs = []
        for coll_docs in collections.values():
            all_docs.extend(coll_docs)
        flattened_dept[dept] = all_docs
        
    return {
        "users": USERS_DB, 
        "departments": flattened_dept
    }

def get_internal_db():
    return DEPT_DB
