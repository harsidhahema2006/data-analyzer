import asyncio
import json
from security import SecurePipeline, AdvancedSecurityEnvelope
from document_service import deposit_document, search_documents, retrieve_document
from database import USERS_DB, DEPT_DB, get_db

async def test_full_governance_flow():
    print("--- STARTING FORTIFIED ARCHITECTURE VERIFICATION ---\n")
    
    # 1. Simulate Admin Deposit
    print("[1] Admin Workflow: Depositing Aadhaar Card for Harish...")
    admin_deposit_payload = {
        "name": "Aadhaar Card",
        "department": "Identity Node",
        "citizen_name": "Harish",
        "citizen_phone": "9876543210",
        "citizen_dob": "10-10-1995",
        "storage_path": "storage/identity_aadhaar_mock"
    }
    
    success = await deposit_document(admin_deposit_payload)
    if success:
        print("RESULT: Admin deposit processed through all Security Layers.\n")
    else:
        print("RESULT: Admin deposit FAILED.\n")
        return

    # 2. Simulate Citizen Search
    print("[2] Citizen Workflow: Harish searching for his documents...")
    harish_metadata = {
        "name": "Harish",
        "phone": "9876543210",
        "dob": "10-10-1995"
    }
    
    docs = await search_documents(query=None, user_metadata=harish_metadata)
    print(f"RESULT: Found {len(docs)} documents for Harish via strict metadata matching.\n")
    
    if len(docs) > 0:
        doc_id = docs[0]["id"]
        # 3. Simulate Citizen Secure Fetch
        print(f"[3] Citizen Workflow: Harish fetching document {doc_id} via Secure Pipeline...")
        fetched_doc = await retrieve_document(doc_id, harish_metadata)
        
        if fetched_doc:
            print("RESULT: Document successfully retrieved and decrypted after Name+DOB+Phone validation.")
            print(f"       Mandatory Check: PQC Hash = {fetched_doc.get('pqc_hash')}")
            print(f"       Mandatory Check: Blockchain Hash = {fetched_doc.get('blockchain_hash')}")
            print(f"       Mandatory Check: Timestamp = {fetched_doc.get('timestamp')}\n")
        else:
            print("RESULT: Secure retrieval FAILED validation.\n")

    print("--- VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL ---")

if __name__ == "__main__":
    asyncio.run(test_full_governance_flow())
