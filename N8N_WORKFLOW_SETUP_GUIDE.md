# n8n Customer Campaign Automation Setup Guide

## Overview
This n8n workflow automates personalized email campaigns for banking customers using:
- **Supabase** for data storage
- **Gemini AI** for message personalization
- **Gmail** for email delivery
- **Webhook** triggers for campaign initiation

## Workflow Steps
1. **Webhook Trigger** - Receives campaign request with segment info
2. **Fetch Bank Products** - Gets relevant products for the customer segment
3. **Fetch Customers** - Retrieves customers from the specified segment table
4. **Combine Data** - Merges customer and product data for AI processing
5. **Process Individually** - Loops through each customer
6. **Generate AI Message** - Creates personalized content using Gemini
7. **Parse AI Response** - Extracts subject and body from AI response
8. **Send Email** - Delivers personalized email to customer
9. **Log Campaign** - Records success/failure in database

## Setup Instructions

### 1. Import Workflow
1. Copy the content from `n8n_customer_campaign_workflow.json`
2. In n8n, go to Workflows → Import from JSON
3. Paste the JSON content and import

### 2. Configure Credentials

#### Supabase Credential
1. In n8n, go to Credentials → Add Credential → Supabase
2. Enter your Supabase details:
   - **URL**: `https://gryogruqtbbobildxrcz.supabase.co`
   - **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeW9ncnVxdGJib2JpbGR4cmN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgzMDM5MCwiZXhwIjoyMDcyNDA2MzkwfQ.C_AD06xF9No-yWV1grkDaNceBtLNtPBEORCDVI7ZiiU`

#### Gmail Credential
1. In n8n, go to Credentials → Add Credential → Gmail OAuth2
2. Follow Google OAuth setup process
3. Test the connection

### 3. Setup Database Tables

#### Create Email Campaign Logs Table
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR(255),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    product_name VARCHAR(255),
    persona_name VARCHAR(255),
    email_subject TEXT,
    email_body TEXT,
    error_message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Configure Nodes

#### Update Credential IDs
Replace these placeholder credential IDs in the workflow:
- `YOUR_SUPABASE_CREDENTIAL_ID` → Your actual Supabase credential ID
- `YOUR_GMAIL_CREDENTIAL_ID` → Your actual Gmail credential ID

#### Update Gemini API Key
In the "Generate AI Message" node, replace:
```
"apiKey": "AIzaSyBtE4QUJl_4-LSZrlW6VZ4XxKk3csJyQAs"
```
With your actual Gemini API key (or keep this one if it's valid).

### 5. Test the Workflow

#### Using the Trigger Script
1. Run the trigger script:
   ```bash
   python trigger_n8n_campaign.py
   ```
2. Choose a segment to test (1-5)
3. Monitor n8n workflow execution

#### Manual Webhook Test
Send POST request to webhook URL with payload:
```json
{
  "segment": "new_and_cautious",
  "cluster_name": "1. New & Cautious"
}
```

## Webhook Payload Format

```json
{
  "segment": "table_name_in_supabase",
  "cluster_name": "Human readable segment name"
}
```

**Example segments:**
- `new_and_cautious` → "1. New & Cautious"
- `stable_earners` → "2. Stable Earners"
- `mid_tier_professionals` → "3. Mid-Tier Professionals"
- `affluent_customers` → "4. Affluent Customers"
- `high_value_elite` → "5. High-Value Elite"

## Required Supabase Tables

### Customer Segment Tables
Each segment needs a table with columns:
- `customer_id`
- `name`
- `email`
- `phone`
- `balance`
- `income`

### Bank Products Table (`bank_products`)
- `product_name`
- `description`
- `key_features`
- `benefits`
- `cluster_name`

### Email Campaign Logs Table (`email_campaign_logs`)
- Automatically created by workflow for tracking

## Monitoring & Debugging

### Check Execution Logs
1. Go to n8n Executions tab
2. View detailed logs for each workflow run
3. Check for errors in individual nodes

### Database Monitoring
Monitor the `email_campaign_logs` table in Supabase to track:
- Successfully sent emails
- Failed deliveries
- Campaign performance

### Common Issues
1. **Credential Errors**: Verify Supabase and Gmail credentials
2. **Missing Tables**: Ensure all required tables exist in Supabase
3. **AI Generation Failures**: Check Gemini API key and limits
4. **Email Delivery Issues**: Verify Gmail OAuth permissions

## Customization

### Modify AI Prompt
Edit the prompt in "Generate AI Message" node to change:
- Tone and style
- Content structure
- Call-to-action messages

### Add New Data Sources
Extend "Combine Customer & Product Data" node to include:
- Customer transaction history
- Behavioral data
- Preferences

### Enhanced Logging
Modify "Log Email Campaign" node to capture:
- Open rates (requires email tracking)
- Click-through rates
- Response rates

## Production Deployment

### Security
1. Use environment variables for API keys
2. Enable proper RLS policies in Supabase
3. Implement rate limiting for webhook

### Scaling
1. Add batch processing for large customer lists
2. Implement queue system for high-volume campaigns
3. Add retry logic for failed deliveries

### Performance
1. Optimize Supabase queries with proper indexes
2. Cache bank products data
3. Implement parallel processing where possible
