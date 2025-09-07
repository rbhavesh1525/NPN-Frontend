import pandas as pd
import joblib
import requests
import google.generativeai as genai
import os
import warnings

# --- Settings ---
warnings.filterwarnings('ignore')
print("--- Starting Segmentation and AI Offer Generation Process ---")

# --- 1. Configure the Gemini API ---
try:
    GOOGLE_API_KEY = "AIzaSyBtE4QUJl_4-LSZrlW6VZ4XxKk3csJyQAs" # Paste your key here
    if GOOGLE_API_KEY == "YOUR_GEMINI_API_KEY":
        print("⚠️ WARNING: Gemini API key is not set. The script will not work.")
        exit()
    genai.configure(api_key=GOOGLE_API_KEY)
    model_gemini = genai.GenerativeModel('gemini-1.5-flash')
    print("✅ Gemini AI model initialized.")
except Exception as e:
    print(f"❌ Error configuring Gemini API: {e}")
    exit()

# --- 2. Define your n8n Webhook URL ---
N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/38484b1d-16d9-41b8-9834-091f29fc4cbc"

# --- 3. Load All Necessary Files ---
try:
    model_pipeline = joblib.load('customer_segmentation_model.joblib')
    df_customers = pd.read_csv('bank-customer-data.csv')
    df_offers = pd.read_csv('banking_products_by_cluster_comprehensive (1).csv')
    print("✅ All necessary files loaded successfully.")
except FileNotFoundError as e:
    print(f"❌ Error: A required file was not found. {e.filename}")
    exit()

# --- 4. Segment ALL Customers ---
data_to_segment = df_customers.copy()
predicted_clusters = model_pipeline.predict(data_to_segment)
data_to_segment['cluster'] = predicted_clusters
cluster_summary = data_to_segment.groupby('cluster')[['income', 'balance']].mean()
cluster_summary.sort_values(by=['income', 'balance'], inplace=True)
sorted_persona_names = [
    '1. New & Cautious', '2. Stable Earners', '3. Mid-Tier Professionals',
    '4. Affluent Customers', '5. High-Value Elite'
]
final_label_map = {cluster_id: name for cluster_id, name in zip(cluster_summary.index, sorted_persona_names)}
data_to_segment['persona_name'] = data_to_segment['cluster'].map(final_label_map)
print("✅ All customers have been segmented.")

# --- 5. Match Customers to Offers ---
df_merged = pd.merge(
    data_to_segment, df_offers,
    left_on='persona_name', right_on='cluster_name', how='left'
)
print("✅ Matched customers to their respective product offers.")

# --- 6. The "Generative AI" Function ---
def generate_ai_message(customer_name, persona_name, offer_details):
    try:
        prompt = f"""
        You are an expert bank marketing copywriter. Your goal is to rewrite a standard banking offer into an attractive, professional, and believable marketing email. The tone should be helpful and build trust.

        Customer Profile:
        - Name: {customer_name}
        - Persona: {persona_name}

        Standard Offer Details:
        - Product Name: {offer_details['product_name']}
        - Description: {offer_details['description']}
        - Key Features: {offer_details['key_features']}

        Generate an email with a compelling subject line and a concise, believable body.
        Format the response as:
        SUBJECT: [Your subject]
        BODY: [Your body]
        """
        response = model_gemini.generate_content(prompt)
        parts = response.text.split("BODY:")
        subject = parts[0].replace("SUBJECT:", "").strip()
        body = parts[1].strip()
        return {"subject": subject, "body": body}
    except Exception as e:
        print(f"  -> ❌ Error generating message with Gemini: {e}")
        return None

# --- 7. Process Data and Prepare a Single Payload ---
print("\n--- 🚀 Generating AI messages for all customers... ---")

# (FIX) Create an empty list to hold all the customer data
all_customer_payloads = []

# To process all, remove the `.head(20)`
for index, customer_row in df_merged.head(20).iterrows():
    ai_generated_content = generate_ai_message(
        customer_name=customer_row['name'],
        persona_name=customer_row['persona_name'],
        offer_details=customer_row
    )
    if ai_generated_content:
        payload = {
            'customer_id': customer_row['customer_id'],
            'name': customer_row['name'],
            'email': customer_row['email'],
            'persona': customer_row['persona_name'],
            'email_subject': ai_generated_content['subject'],
            'email_body': ai_generated_content['body']
        }
        # (FIX) Add the completed payload to our list
        all_customer_payloads.append(payload)

print(f"✅ Generated {len(all_customer_payloads)} personalized messages.")

# --- 8. Send the Entire Batch to n8n in a Single Request ---
if all_customer_payloads:
    print(f"\n--- 📤 Sending a single JSON payload with {len(all_customer_payloads)} customers to n8n... ---")
    try:
        # (FIX) Send the entire list as the JSON payload
        response = requests.post(N8N_WEBHOOK_URL, json=all_customer_payloads)
        
        if response.status_code == 200:
            print("  -> ✅ Successfully sent the complete batch to n8n.")
        else:
            print(f"  -> ⚠️ Failed to send batch to n8n. Status Code: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"  -> ❌ Connection Error: {e}")

print("\n--- ✅ Process Complete ---")