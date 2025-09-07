import pandas as pd
import warnings

# --- Settings ---
warnings.filterwarnings('ignore')
print("--- Starting Dynamic Offer Generation Process ---")


# --- 1. Load Your Datasets ---
try:
    # Load your new, comprehensive offers dataset
    df_offers = pd.read_csv('banking_products_by_cluster_comprehensive (1).csv')
    print("✅ Banking products dataset loaded successfully.")
    
    # In a real system, you would load your full customer list.
    # Here, we simulate a few sample customers from each segment.
    sample_customers = [
        {'name': 'Hilyen', 'persona_name': '1. New & Cautious'},
        {'name': 'Benjamin Kim', 'persona_name': '2. Stable Earners'},
        {'name': 'Charlotte Moore', 'persona_name': '3. Mid-Tier Professionals'},
        {'name': 'A Lopez', 'persona_name': '4. Affluent Customers'},
        {'name': 'Jack Rodriguez', 'persona_name': '5. High-Value Elite'}
    ]
    print("✅ Sample customer data ready.")

except FileNotFoundError:
    print("❌ Error: Make sure 'banking_products_by_cluster_comprehensive (1).csv' is in the correct directory.")
    exit()


# --- 2. The "Generative AI" Message Creator ---
def generate_professional_offers(customer, offer_details):
    """
    Takes customer data and structured offer details from your file,
    then rewrites them into professional, eye-catching marketing messages.
    """
    # Extract details for easy use
    customer_name = customer['name']
    product_name = offer_details['product_name']
    # Split key features from your CSV for use in bullet points or lists
    key_features = offer_details['key_features'].split(',')
    
    # --- Dynamic Message Templates ---
    generated_messages = {
        "Email Subject Line": f"An Exclusive Invitation for {customer_name}: Discover the {product_name}",
        
        "Email Body (Professional & Benefit-Focused)": (
            f"Dear {customer_name},\n\n"
            f"Based on your profile as a valued '{customer['persona_name']}' customer, we are pleased to present an opportunity tailored for you: the **{product_name}**.\n\n"
            f"{offer_details['description']}\n\n"
            f"This product is designed to help you achieve your goals by offering these key features:\n"
            f"  • {key_features[0].strip()}\n"
            f"  • {key_features[1].strip()}\n"
            f"  • {key_features[2].strip()}\n\n"
            f"To learn more or to activate this exclusive offer, please visit our website or connect with your relationship manager.\n\n"
            f"Sincerely,\nThe Bank Team"
        ),
        
        "SMS / In-App Notification (Concise & Urgent)": (
            # This uses the pre-written personalized message from your CSV for a concise option
            f"Hi {customer_name}, {offer_details['personalized_message']}"
        )
    }
    
    return generated_messages

# --- 3. Process Customers and Generate Offers ---
print("\n--- 🚀 Generating Personalized Offers for Each Segment ---")

for customer in sample_customers:
    persona = customer['persona_name']
    
    # --- Dynamic Offer Fetching ---
    # Fetch the correct offer from your offers dataset for the customer's persona.
    # We'll pick the first offer listed for that cluster as an example.
    offer_for_persona = df_offers[df_offers['cluster_name'] == persona].iloc[0]
    
    # Generate the professional, eye-catching messages using the data from your file
    professional_messages = generate_professional_offers(customer, offer_for_persona)
    
    # Display the results
    print("\n" + "="*70)
    print(f"👤 CUSTOMER: {customer['name']} | 🎯 PERSONA: {persona}")
    print(f"✨ PRODUCT (from your file): {offer_for_persona['product_name']}")
    print("-"*70)
    for style, message in professional_messages.items():
        print(f"\n--- {style} ---")
        print(message)
    print("="*70)