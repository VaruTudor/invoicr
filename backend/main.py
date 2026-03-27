import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Invoice Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InvoicePayload(BaseModel):
    invoice_data: dict


class InvoiceResponse(BaseModel):
    id: str
    invoice_data: dict
    created_at: str
    updated_at: str


@app.get("/invoices", response_model=list[InvoiceResponse])
def list_invoices():
    result = supabase.table("invoices").select("*").order("created_at", desc=True).execute()
    return result.data


@app.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: str):
    result = supabase.table("invoices").select("*").eq("id", invoice_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return result.data[0]


@app.post("/invoices", response_model=InvoiceResponse, status_code=201)
def create_invoice(payload: InvoicePayload):
    result = supabase.table("invoices").insert({"invoice_data": payload.invoice_data}).execute()
    return result.data[0]


@app.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(invoice_id: str, payload: InvoicePayload):
    result = (
        supabase.table("invoices")
        .update({"invoice_data": payload.invoice_data})
        .eq("id", invoice_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return result.data[0]


@app.delete("/invoices/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: str):
    result = supabase.table("invoices").delete().eq("id", invoice_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return None
