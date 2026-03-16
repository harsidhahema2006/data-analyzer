from database import load_departmental_data, DEPT_DB

load_departmental_data()

print("--- Public Templates in Each Node ---")
count = 0
for dept, colls in DEPT_DB.items():
    for coll, docs in colls.items():
        for d in docs:
            if not d.get("citizen_name"):
                print(f"[{dept}] {d['name']}")
                count += 1

print(f"\nTotal: {count} public templates found")
