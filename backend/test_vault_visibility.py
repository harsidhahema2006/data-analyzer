import asyncio
import json
import os
from document_service import search_documents
from database import load_departmental_data, USERS_DB

async def test_visibility():
    load_departmental_data()
    # Mock user 'war'
    user_metadata = {
        'name': 'war',
        'phone': '9443346124',
        'dob': '02-03-2020'
    }
    
    print(f"Testing visibility for citizen: {user_metadata['name']}")
    results = await search_documents('', user_metadata)
    
    print(f"\n--- Vault Results ({len(results)} found) ---")
    for r in results:
        owner = r.get('citizen_name', 'TEMPLATE (Public)')
        print(f"[{r['department']}] {r['name']} - OWNER: {owner}")

if __name__ == "__main__":
    asyncio.run(test_visibility())
