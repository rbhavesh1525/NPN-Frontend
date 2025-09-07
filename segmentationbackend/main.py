import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
from pydantic import BaseModel
import warnings
import io
import re
import uuid
import requests

# --- Settings ---
warnings.filterwarnings('ignore')

# --- Initialize FastAPI App ---
app = FastAPI(
    title="Customer Segmentation API",
    description="Upload a CSV, segment customers, and store them in Supabase."
)

# --- Add CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Define the Mapping to Your Exact Supabase Table Names ---
TABLE_NAME_MAP = {
    'New & Cautious': 'new_and_cautious',
    'Stable Earners': 'stable_earners',
    'Mid-Tier Professionals': 'mid_tier_professionals',
    'Affluent Customers': 'affluent_customers',
    'High-Value Elite': 'high_value_elite'
}

# --- Load Model and Connect to Supabase ---
try:
    model_pipeline = joblib.load('customer_segmentation_model.joblib')
    print("✅ Trained model loaded successfully.")

    SUPABASE_URL = "https://gryogruqtbbobildxrcz.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeW9ncnVxdGJib2JpbGR4cmN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgzMDM5MCwiZXhwIjoyMDcyNDA2MzkwfQ.C_AD06xF9No-yWV1grkDaNceBtLNtPBEORCDVI7ZiiU"
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized.")

except FileNotFoundError:
    print("❌ FATAL ERROR: 'customer_segmentation_model.joblib' not found.")
    model_pipeline = None

# --- API Endpoint ---
@app.post("/segment-and-store")
async def segment_and_store(file: UploadFile = File(...)):
    if not model_pipeline:
        raise HTTPException(status_code=500, detail="Model is not loaded on the server.")
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV.")

    try:
        contents = await file.read()
        df_new = pd.read_csv(io.BytesIO(contents))
        
        data_to_segment = df_new.copy()
        data_to_segment.replace(['_INVALID_', '_RARE_'], np.nan, inplace=True)
        data_to_segment.dropna(inplace=True)
        
        for col in ['has_loan', 'has_credit_card', 'has_investment']:
            if col in data_to_segment.columns:
                data_to_segment[col] = data_to_segment[col].astype(int)
        for col in ['age', 'income', 'balance', 'account_tenure']:
            if col in data_to_segment.columns:
                data_to_segment[col] = pd.to_numeric(data_to_segment[col], errors='coerce')
        data_to_segment.dropna(inplace=True)

        predicted_clusters = model_pipeline.predict(data_to_segment)
        data_to_segment['cluster'] = predicted_clusters
        
        print(f"✅ Successfully segmented {len(data_to_segment)} customers.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

    # --- Data-Driven Naming Logic ---
    cluster_summary = data_to_segment.groupby('cluster')[['income', 'balance', 'age']].mean()
    cluster_summary.sort_values(by=['income', 'balance'], inplace=True)
    
    sorted_persona_names = list(TABLE_NAME_MAP.keys())
    
    final_label_map = {cluster_id: name for cluster_id, name in zip(cluster_summary.index, sorted_persona_names)}
    data_to_segment['persona_name'] = data_to_segment['cluster'].map(final_label_map)
    print("✅ Persona names assigned.")

    # --- Store Data in Supabase ---
    results = {"message": "Segmentation successful.", "clusters": {}}
    
    for persona_name in sorted_persona_names:
        table_name = TABLE_NAME_MAP.get(persona_name)
        if not table_name:
            continue

        cluster_df = data_to_segment[data_to_segment['persona_name'] == persona_name]
        
        if not cluster_df.empty:
            records = cluster_df.drop(columns=['cluster', 'persona_name']).to_dict(orient='records')
            try:
                # --- (FIX) Use .upsert() instead of .insert() ---
                # This will update existing records and insert new ones.
                data, count = supabase.table(table_name).upsert(records, on_conflict='customer_id').execute()
                
                results["clusters"][table_name] = {"processed_count": len(records), "status": "success"}
                print(f"  -> Upserted {len(records)} records into {table_name}")
            except Exception as e:
                results["clusters"][table_name] = {"processed_count": 0, "status": "failed", "error": str(e)}
                print(f"  -> FAILED to upsert into {table_name}: {e}")

    return results

# --- n8n Campaign Success Webhook ---
@app.post("/campaign-success")
async def campaign_success_webhook(request_data: dict):
    """
    Webhook endpoint to receive campaign completion notification from n8n
    Updates campaign status in database
    """
    try:
        print(f"📧 Campaign success notification received: {request_data}")
        print(f"📊 Request data keys: {list(request_data.keys())}")
        
        campaign_id = request_data.get("campaign_id")
        if not campaign_id:
            print(f"❌ Missing campaign_id in request: {request_data}")
            raise HTTPException(status_code=400, detail=f"campaign_id is required. Received: {list(request_data.keys())}")
        
        print(f"📋 Processing campaign completion for: {campaign_id}")
        
        # Calculate completion time on our backend
        completed_at = datetime.now().isoformat()
        
        # Get the campaign details to find segment and calculate customer count
        emails_sent = 0
        try:
            campaign_result = supabase.table("campaign_logs")\
                .select("segment_name")\
                .eq("campaign_id", campaign_id)\
                .execute()
            
            print(f"🔍 Campaign lookup result: {campaign_result.data}")
            
            if campaign_result.data and len(campaign_result.data) > 0:
                segment_name = campaign_result.data[0].get("segment_name")
                table_name = TABLE_NAME_MAP.get(segment_name)
                
                print(f"🔍 Found segment: '{segment_name}', mapped table: '{table_name}'")
                
                if table_name:
                    try:
                        # Try multiple methods to count customers
                        print(f"📧 Counting emails sent in table: {table_name}")
                        
                        # Method 1: Count with exact
                        count_result = supabase.table(table_name).select("*", count="exact").execute()
                        emails_sent = count_result.count if count_result.count is not None else 0
                        
                        print(f"📧 Method 1 - Count result: {count_result.count}")
                        
                        # If Method 1 fails, try Method 2
                        if emails_sent == 0:
                            count_result2 = supabase.table(table_name).select("customer_id").execute()
                            emails_sent = len(count_result2.data) if count_result2.data else 0
                            print(f"📧 Method 2 - Manual count: {emails_sent}")
                            
                        print(f"📧 Final calculated {emails_sent} emails sent for {segment_name} segment")
                        
                    except Exception as e:
                        print(f"⚠️ Error counting customers for emails_sent: {e}")
                        print(f"⚠️ Error type: {type(e).__name__}")
                        emails_sent = 0
                else:
                    print(f"❌ No table mapping found for segment: '{segment_name}'")
            else:
                print(f"⚠️ Campaign {campaign_id} not found in database, will use fallback")
                
        except Exception as e:
            print(f"⚠️ Error fetching campaign details: {e}")
            print(f"⚠️ Error type: {type(e).__name__}")
            emails_sent = 0
        
        # Update campaign status in database
        update_data = {
            "status": "completed",
            "completed_at": completed_at,
            "emails_sent": emails_sent  # Store calculated customer count as emails sent
        }
        
        # Update the campaign in database with retry logic
        try:
            result = supabase.table("campaign_logs")\
                .update(update_data)\
                .eq("campaign_id", campaign_id)\
                .execute()
            
            if not result.data:
                print(f"⚠️ Campaign {campaign_id} not found in database, creating new entry")
                # If campaign doesn't exist, create it
                campaign_info = {
                    "campaign_id": campaign_id,
                    "campaign_name": request_data.get("campaign_name", "Unknown Campaign"),
                    "segment_name": request_data.get("segment", "Unknown Segment"),
                    "product_name": request_data.get("product_name"),
                    "status": "completed",
                    "started_at": request_data.get("started_at", datetime.now().isoformat()),
                    "completed_at": update_data["completed_at"],
                    "emails_sent": update_data["emails_sent"],
                    "total_customers": request_data.get("total_customers", 0),
                    "success_rate": update_data.get("success_rate")
                }
                result = supabase.table("campaign_logs").insert(campaign_info).execute()
                
        except Exception as db_error:
            print(f"❌ Database error updating campaign {campaign_id}: {db_error}")
            # Continue execution even if database update fails
            print(f"⚠️ Campaign completion noted but not saved to database")
        
        print(f"✅ Campaign {campaign_id} marked as completed")
        
        return {
            "status": "success",
            "message": "Campaign completion notification processed",
            "campaign_id": campaign_id,
            "updated_data": update_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing campaign success webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process webhook: {str(e)}")

# --- Campaign Logging Functions ---

class CampaignStartRequest(BaseModel):
    campaign_name: str
    segment_name: str
    product_name: str = None
    total_customers: int = 0

class CampaignLogResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    segment_name: str
    status: str
    started_at: str

def generate_campaign_id(campaign_name: str, segment_name: str) -> str:
    """Generate a unique campaign ID"""
    # Clean campaign name and segment name for ID
    clean_name = re.sub(r'[^a-zA-Z0-9]', '_', campaign_name.lower())
    clean_segment = re.sub(r'[^a-zA-Z0-9]', '_', segment_name.lower())
    timestamp = int(datetime.now().timestamp() * 1000)  # milliseconds
    
    return f"{clean_name}_{clean_segment}_{timestamp}"

@app.post("/campaigns/start")
async def start_campaign(request: CampaignStartRequest):
    """
    Start a new campaign and log it to database
    """
    try:
        # Generate campaign ID
        campaign_id = generate_campaign_id(request.campaign_name, request.segment_name)
        
        # Calculate actual customer count from database
        table_name = TABLE_NAME_MAP.get(request.segment_name)
        total_customers = 0
        
        print(f"🔍 Segment name received: '{request.segment_name}'")
        print(f"🔍 Mapped table name: '{table_name}'")
        print(f"🔍 Available mappings: {list(TABLE_NAME_MAP.keys())}")
        
        if table_name:
            try:
                # Try different counting methods
                print(f"📊 Counting customers in table: {table_name}")
                
                # Method 1: Count with specific column
                result = supabase.table(table_name).select("*", count="exact").execute()
                total_customers = result.count if result.count is not None else 0
                
                print(f"📊 Method 1 - Count result: {result.count}")
                print(f"📊 Method 1 - Data sample: {result.data[:2] if result.data else 'No data'}")
                
                # If Method 1 fails, try Method 2: Simple select
                if total_customers == 0:
                    result2 = supabase.table(table_name).select("customer_id").execute()
                    total_customers = len(result2.data) if result2.data else 0
                    print(f"📊 Method 2 - Manual count: {total_customers}")
                
                print(f"📊 Final calculated {total_customers} customers in {request.segment_name} segment")
                
            except Exception as e:
                print(f"⚠️ Error counting customers in {table_name}: {e}")
                print(f"⚠️ Error type: {type(e).__name__}")
                print(f"⚠️ Error details: {str(e)}")
                total_customers = 0
        else:
            print(f"❌ No table mapping found for segment: '{request.segment_name}'")
        
        # Insert campaign log into database
        campaign_data = {
            "campaign_id": campaign_id,
            "campaign_name": request.campaign_name,
            "segment_name": request.segment_name,
            "product_name": request.product_name,
            "status": "running",
            "total_customers": total_customers,  # Use calculated count
            "started_at": datetime.now().isoformat()
        }
        
        result = supabase.table("campaign_logs").insert(campaign_data).execute()
        
        print(f"📊 Campaign started: {campaign_id}")
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "message": "Campaign started successfully",
            "data": campaign_data
        }
        
    except Exception as e:
        print(f"Error starting campaign: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start campaign: {str(e)}")

@app.get("/campaigns/recent")
async def get_recent_campaigns(limit: int = 10):
    """
    Get recent campaigns with their status
    """
    try:
        # Fetch recent campaigns from database
        result = supabase.table("campaign_logs")\
            .select("*")\
            .order("started_at", desc=True)\
            .limit(limit)\
            .execute()
        
        campaigns = result.data if result.data else []
        
        return {
            "success": True,
            "campaigns": campaigns,
            "total": len(campaigns)
        }
        
    except Exception as e:
        print(f"Error fetching recent campaigns: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaigns: {str(e)}")

# --- Dashboard Statistics Endpoint ---
@app.get("/dashboard/stats")
async def get_dashboard_stats():
    """
    Get dashboard statistics including total customers and total messages sent
    """
    try:
        # Get total customers from all segment tables
        total_customers = 0
        customer_counts = {}
        
        for segment_label, table_name in TABLE_NAME_MAP.items():
            try:
                result = supabase.table(table_name).select("*", count="exact").execute()
                count = result.count if result.count is not None else 0
                customer_counts[segment_label] = count
                total_customers += count
            except Exception as e:
                print(f"⚠️ Error counting {segment_label}: {e}")
                customer_counts[segment_label] = 0
        
        # Get total messages sent from campaign logs
        try:
            campaigns_result = supabase.table("campaign_logs")\
                .select("emails_sent")\
                .execute()
            
            total_messages_sent = 0
            if campaigns_result.data:
                for campaign in campaigns_result.data:
                    emails_sent = campaign.get("emails_sent", 0)
                    if emails_sent and emails_sent > 0:
                        total_messages_sent += emails_sent
                        
            print(f"📧 Total messages sent calculated: {total_messages_sent}")
                    
        except Exception as e:
            print(f"⚠️ Error calculating messages sent: {e}")
            total_messages_sent = 0
        
        return {
            "success": True,
            "total_customers": total_customers,
            "total_messages_sent": total_messages_sent,
            "customer_counts": customer_counts
        }
        
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")

@app.get("/campaigns/{campaign_id}")
async def get_campaign_status(campaign_id: str):
    """
    Get status of a specific campaign
    """
    try:
        result = supabase.table("campaign_logs")\
            .select("*")\
            .eq("campaign_id", campaign_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = result.data[0]
        
        return {
            "success": True,
            "campaign": campaign
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching campaign status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaign: {str(e)}")

# --- Get Customer Counts Endpoint ---
@app.get("/segments/customer-counts")
async def get_customer_counts():
    """
    Get actual customer counts from database for each segment
    """
    try:
        customer_counts = {}
        
        for segment_label, table_name in TABLE_NAME_MAP.items():
            try:
                print(f"🔍 Checking table: {table_name} for segment: {segment_label}")
                
                # Try multiple methods to count
                # Method 1: Count exact
                result = supabase.table(table_name).select("*", count="exact").execute()
                count_method1 = result.count if result.count is not None else 0
                
                # Method 2: Manual count
                result2 = supabase.table(table_name).select("customer_id").execute()
                count_method2 = len(result2.data) if result2.data else 0
                
                # Use the higher count
                final_count = max(count_method1, count_method2)
                customer_counts[segment_label] = final_count
                
                print(f"📊 {segment_label}: Method1={count_method1}, Method2={count_method2}, Final={final_count}")
                
            except Exception as e:
                print(f"⚠️ Error counting {segment_label}: {e}")
                customer_counts[segment_label] = 0
        
        return {
            "success": True,
            "customer_counts": customer_counts,
            "total_customers": sum(customer_counts.values())
        }
        
    except Exception as e:
        print(f"❌ Error fetching customer counts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch customer counts: {str(e)}")

# --- Test Customer Count for Specific Segment ---
@app.get("/test-count/{segment_name}")
async def test_customer_count(segment_name: str):
    """
    Test customer count for a specific segment
    """
    try:
        table_name = TABLE_NAME_MAP.get(segment_name)
        if not table_name:
            return {
                "error": f"Segment '{segment_name}' not found",
                "available_segments": list(TABLE_NAME_MAP.keys())
            }
        
        print(f"🧪 Testing count for segment: '{segment_name}' → table: '{table_name}'")
        
        # Method 1: Count exact
        result1 = supabase.table(table_name).select("*", count="exact").execute()
        count1 = result1.count if result1.count is not None else 0
        
        # Method 2: Manual count
        result2 = supabase.table(table_name).select("customer_id").execute()
        count2 = len(result2.data) if result2.data else 0
        
        # Method 3: Count with limit
        result3 = supabase.table(table_name).select("customer_id").limit(1000).execute()
        count3 = len(result3.data) if result3.data else 0
        
        return {
            "segment_name": segment_name,
            "table_name": table_name,
            "count_exact": count1,
            "count_manual": count2,
            "count_limited": count3,
            "sample_data": result2.data[:3] if result2.data else [],
            "recommended_count": max(count1, count2, count3)
        }
        
    except Exception as e:
        print(f"❌ Test count error: {e}")
        return {"error": str(e), "segment": segment_name}

# --- N8N Webhook Proxy Endpoint ---
@app.post("/trigger-n8n-campaign")
async def trigger_n8n_campaign(payload: dict):
    """
    Proxy endpoint to trigger n8n campaign workflow
    This avoids CORS issues by routing through our backend
    """
    try:
        print(f"📤 Proxying to n8n: {payload}")
        
        # Make request to n8n webhook
        n8n_url = "http://localhost:5678/webhook-test/campaign-trigger"
        
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                n8n_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )
            
        if response.status_code == 200:
            print("✅ Successfully triggered n8n campaign")
            return {
                "success": True,
                "message": "Campaign triggered successfully",
                "n8n_response": response.json() if response.content else {}
            }
        else:
            print(f"❌ n8n responded with status {response.status_code}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"n8n webhook failed: {response.text}"
            )
            
    except Exception as e:
        print(f"❌ Error triggering n8n campaign: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger n8n campaign: {str(e)}"
        )

# --- Health Check Endpoint ---
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify API is running
    """
    return {
        "status": "healthy",
        "message": "Customer Segmentation & Contact API is running",
        "endpoints": {
            "segmentation": "/segment-and-store",
            "contacts": "/contacts",
            "campaign_success": "/campaign-success",
            "health": "/health"
        }
    }

# To run the server: uvicorn main:app --reload