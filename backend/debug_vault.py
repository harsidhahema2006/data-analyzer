import sys
import traceback

try:
    from database import load_departmental_data, get_db, DEPT_DB

    print("=== Step 1: load_departmental_data() ===")
    load_departmental_data()
    print("OK")

    print("\n=== Step 2: DEPT_DB contents ===")
    for dept, colls in DEPT_DB.items():
        total = sum(len(v) for v in colls.values())
        generic = len(colls.get("Generic", []))
        print(f"  {dept}: total={total}, generic={generic}")
        for doc in colls.get("Generic", []):
            print(f"    - {doc['name']} (citizen_name: {doc.get('citizen_name', 'NONE')})")

    print("\n=== Step 3: get_db() flattened ===")
    db = get_db()
    for dept, docs in db["departments"].items():
        print(f"  {dept}: {len(docs)} docs")

    print("\n=== Step 4: Filter (no user_metadata) ===")
    all_docs = []
    for dept, docs in db["departments"].items():
        for d in docs:
            if not d.get("citizen_name"):
                all_docs.append(d)
    print(f"  Public templates found: {len(all_docs)}")
    for d in all_docs:
        print(f"  - [{d['department']}] {d['name']}")

    print("\nALL OK")
except Exception as e:
    print(f"\nEXCEPTION: {e}")
    traceback.print_exc()
    sys.exit(1)
