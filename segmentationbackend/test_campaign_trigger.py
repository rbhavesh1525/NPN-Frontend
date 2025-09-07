import requests
import json

def test_campaign_trigger():
    """
    Test the campaign trigger with sample data
    """
    # Test data matching your database structure
    campaign_data = {
        "segment": "stable_earners",  # Table name in Supabase
        "cluster_name": "Stable Earners",  # Human readable name
        "product_name": "Auto Loan",  # Bank product to promote
        "campaign_name": "Summer Auto Loan Campaign"  # Campaign name from frontend
    }
    
    webhook_url = "http://localhost:5678/webhook-test/campaign-trigger"
    
    try:
        print("🚀 Triggering campaign...")
        print(f"Data: {json.dumps(campaign_data, indent=2)}")
        
        response = requests.post(
            webhook_url,
            json=campaign_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Campaign triggered successfully!")
            print(f"Response: {response.text}")
        else:
            print(f"❌ Failed to trigger campaign")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
        print("Make sure n8n is running on localhost:5678")

if __name__ == "__main__":
    test_campaign_trigger()
