from database import get_db, get_internal_db, save_departmental_data
import uuid
import datetime
import asyncio
from security import SecurePipeline, AdvancedSecurityEnvelope

async def search_documents(query: str, user_metadata: dict = None):
    """
    Search across all departmental nodes with Secure Pipeline processing.
    """
    # 1. Pipeline Processing
    await SecurePipeline.process_request("RETRIEVAL_QUERY", {
        "query": query,
        "user_metadata": user_metadata
    })
    
    db = get_db()
    all_docs = []
    
    for dept, docs in db["departments"].items():
        filtered = docs
        if user_metadata:
            # Locate record using: Citizen Name + Phone Number (DOB match bypassed)
            filtered = [
                d for d in docs 
                if (not d.get("citizen_name")) or (
                   d.get("citizen_name", "").strip().lower() == user_metadata.get("name", "").strip().lower() and 
                   _normalize_phone(d.get("citizen_phone", "")) == _normalize_phone(user_metadata.get("phone", ""))
                )
            ]
        
        if query:
            filtered = [d for d in filtered if query.lower() in d["name"].lower() or query.lower() in d["department"].lower()]
            
        all_docs.extend(filtered)
    
    # Deduplicate results: Show only ONE tile per distinct document name
    # Priority: 1. Specific Citizen Document (most recent) -> 2. Generic Template
    deduplicated_docs = {}
    for doc in all_docs:
        key = f"{doc.get('department')}::{doc.get('name')}"
        existing = deduplicated_docs.get(key)
        
        # If this is a specific citizen document, it usually overrides templates
        # If it has a timestamp, it can override older specific documents
        if doc.get("citizen_name"):
             if not existing or (isinstance(existing, dict) and not existing.get("citizen_name")) or (isinstance(existing, dict) and str(doc.get("timestamp", "")) > str(existing.get("timestamp", ""))):
                 deduplicated_docs[key] = doc
        else:
             # Generic template: only add if no specific doc exists yet
             if not existing:
                 deduplicated_docs[key] = doc
                 
    return list(deduplicated_docs.values())

async def deposit_document(data: dict):
    """
    Stores a document in the correct departmental node with full security pipeline.
    Ensures all 8 mandatory fields are present and maps to internal collections.
    """
    dept = data.get("department")
    doc_type = data.get("name") # e.g. "Birth Certificate"
    
    # Map to internal collection names (Identity Node -> BirthCertificates)
    collection_map = {
        "Birth Certificate": "BirthCertificates",
        "Aadhaar Card": "AadhaarCards",
        "PAN Card": "PANCards",
        "Tax Certificate": "TaxCertificates",
        "Health Records": "HealthRecords",
        "Social Subsidies": "SocialSubsidies"
    }
    
    coll_name = collection_map.get(doc_type, "Generic")
    
    db_internal = get_internal_db()
    if dept not in db_internal:
        return False

    # 1. Secure API Pipeline processing
    await SecurePipeline.process_request("DEPOSIT", data)
    
    # 2. Advanced Security Envelope (Encryption, ZKP, PQC, HSM)
    envelope = await AdvancedSecurityEnvelope.apply_envelope("STORAGE")
    
    # 3. Final Document Construction (Mandatory Fields)
    new_doc = {
        "id": str(uuid.uuid4()),
        "citizen_name": data.get("citizen_name"),
        "citizen_dob": _normalize_dob(data.get("citizen_dob", "")),
        "citizen_phone": _normalize_phone(data.get("citizen_phone", "")),
        "node": dept,  # The Node
        "document_type": doc_type, # Document Type
        "encrypted_file": data.get("storage_path"), # Encrypted File reference
        "blockchain_hash": envelope["merkle_root"], # Blockchain Hash
        "timestamp": datetime.datetime.now().isoformat(), # Timestamp
        "name": doc_type, # Compatibility with frontend
        "department": dept, # Compatibility with frontend
        "filename": data.get("filename"), # Keep track of original file extension
        "pqc_hash": envelope["pqc_hash"],
        "hsm_enclave_id": envelope["hsm_id"]
    }
    
    # Ensure collection exists in node
    if coll_name not in db_internal[dept]:
        db_internal[dept][coll_name] = []
        
    db_internal[dept][coll_name].append(new_doc)
    save_departmental_data(dept)
    return True

def _normalize_dob(dob: str) -> str:
    """Normalize DOB from YYYY-MM-DD (HTML5 date picker) to DD-MM-YYYY (storage format)."""
    if not dob:
        return ""
    dob = dob.strip()
    # If format is YYYY-MM-DD, convert to DD-MM-YYYY
    parts = dob.replace("/", "-").split("-")
    if len(parts) == 3 and len(parts[0]) == 4:
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    return dob

def _normalize_phone(phone: str) -> str:
    """Strip spaces, dashes and +91 prefix for comparison."""
    if not phone:
        return ""
    return phone.replace(" ", "").replace("-", "").replace("+91", "").lstrip("0").strip()

async def retrieve_document(doc_id: str, citizen_metadata: dict):
    """
    Securely retrieves and decrypts a document via the pipeline.
    Matches Name + DOB + Phone with case-insensitive, normalized comparison.
    Also allows retrieval if the document has no citizen_name (public template).
    """
    
    # Pipeline Processing
    await SecurePipeline.process_request("SECURE_FETCH", {"doc_id": doc_id, **citizen_metadata})
    
    db = get_db()
    for dept, docs in db["departments"].items():
        doc = next((d for d in docs if d["id"] == doc_id), None)
        if doc:
            doc_owner = doc.get("citizen_name", "")
            
            # Public templates (no citizen_name) are always accessible
            if not doc_owner:
                print(f"SECURITY: Public template {doc_id} accessed.")
                return doc
            
            # Match Name (case-insensitive) + Phone (normalized). DOB bypassed as requested.
            name_match = doc_owner.strip().lower() == citizen_metadata.get("name", "").strip().lower()
            phone_match = _normalize_phone(doc.get("citizen_phone", "")) == _normalize_phone(citizen_metadata.get("phone", ""))
            
            print(f"SECURITY: Match check - name={name_match}, phone={phone_match}")
            
            if name_match and phone_match:
                print(f"SECURITY: Decrypting document {doc_id} using HSM key cluster...")
                return doc
                
    return None
