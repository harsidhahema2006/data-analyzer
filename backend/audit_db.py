import asyncio
import json
import os
from database import get_db, load_departmental_data, DEPT_STORAGE_FILES, DEPT_DB

def audit_db_integrity():
    print("--- Backend DB Integrity Audit ---")
    load_departmental_data()
    
    print(f"\n1. In-memory DEPT_DB keys: {list(DEPT_DB.keys())}")
    for dept, data in DEPT_DB.items():
        template_count = len(data.get("Generic", []))
        total_count = sum(len(docs) for docs in data.values())
        print(f"   [{dept}]: Templates={template_count}, Total Records={total_count}")
        if template_count > 0:
            print(f"      Names: {[d['name'] for d in data['Generic']]}")

    db = get_db()
    flattened = db["departments"]
    print(f"\n2. Flattened Departments keys: {list(flattened.keys())}")
    
    print("\n3. Full Search Result (Empty Query):")
    from document_service import search_documents
    results = asyncio.run(search_documents(""))
    print(f"   Found {len(results)} total accessible records.")
    for r in results:
        print(f"   - [{r['department']}] {r['name']} (Owner: {r.get('citizen_name', 'PUBLIC')})")

if __name__ == "__main__":
    audit_db_integrity()
