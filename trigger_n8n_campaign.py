import requests
import json

# n8n webhook URL - Update this with your actual n8n webhook URL
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/campaign-trigger"

# Test payloads for different segments
test_campaigns = [
    {
        "segment": "new_and_cautious",
        "cluster_name": "1. New & Cautious"
    },
    {
        "segment": "stable_earners", 
        "cluster_name": "2. Stable Earners"
    },
    {
        "segment": "mid_tier_professionals",
        "cluster_name": "3. Mid-Tier Professionals"
    },
    {
        "segment": "affluent_customers",
        "cluster_name": "4. Affluent Customers"
    },
    {
        "segment": "high_value_elite",
        "cluster_name": "5. High-Value Elite"
    }
]

def trigger_campaign(campaign_data):
    """
    Trigger n8n campaign workflow with segment data
    """
    try:
        print(f"🚀 Triggering campaign for: {campaign_data['cluster_name']}")
        
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=campaign_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print(f"✅ Campaign triggered successfully!")
            print(f"   Response: {response.text}")
        else:
            print(f"❌ Failed to trigger campaign. Status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")

def main():
    print("=== n8n Customer Campaign Trigger ===\n")
    
    # Show available campaigns
    print("Available campaigns:")
    for i, campaign in enumerate(test_campaigns, 1):
        print(f"{i}. {campaign['cluster_name']} (Table: {campaign['segment']})")
    
    print("\nOptions:")
    print("- Enter 1-5 to trigger specific campaign")
    print("- Enter 'all' to trigger all campaigns")
    print("- Enter 'q' to quit")
    
    while True:
        choice = input("\nYour choice: ").strip().lower()
        
        if choice == 'q':
            print("👋 Goodbye!")
            break
        elif choice == 'all':
            print("\n🔄 Triggering ALL campaigns...")
            for campaign in test_campaigns:
                trigger_campaign(campaign)
                print("-" * 50)
        elif choice.isdigit() and 1 <= int(choice) <= 5:
            campaign_index = int(choice) - 1
            trigger_campaign(test_campaigns[campaign_index])
        else:
            print("❌ Invalid choice. Please enter 1-5, 'all', or 'q'")

if __name__ == "__main__":
    main()
