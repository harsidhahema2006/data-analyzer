import json
import os

DEPT_STORAGE_FILES = {
    "Identity Node": "backend/db_identity.json",
    "Income Node": "backend/db_income.json",
    "Health Node": "backend/db_health.json",
    "Social Node": "backend/db_social.json"
}

def verify_documents():
    results = {}
    for dept, filename in DEPT_STORAGE_FILES.items():
        if os.path.exists(filename):
            with open(filename, "r") as f:
                results[dept] = json.load(f)
        else:
            results[dept] = "FILE NOT FOUND"
    return results

if __name__ == "__main__":
    import pprint
    pprint.pprint(verify_documents())
