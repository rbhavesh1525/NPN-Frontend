# Frontend to n8n Campaign Integration Setup Guide

## 🎯 Overview
This integration connects your React frontend MessageGeneration page with n8n automation to run real email campaigns.

## 📋 What's Updated

### Frontend Changes (MessageGeneration.jsx)
✅ **Added Bank Product Selection**
- New dropdown to select bank products for each segment
- Products are filtered based on selected customer segment

✅ **Changed Button from "Generate Message" to "Run Campaign"**
- Now calls real n8n webhook instead of fake timeout
- Sends actual campaign data to n8n automation

✅ **Enhanced Success Modal**
- Shows campaign name, selected product, and segment info
- Displays after successful n8n webhook call

### Backend Changes (main.py)
✅ **Added Campaign Success Webhook**
- New endpoint `/campaign-success` to receive notifications from n8n
- Logs campaign completion for tracking

### n8n Workflow Updates
✅ **Enhanced Automation**
- Processes individual customers with Gemini AI
- Generates both email subject and body
- Sends personalized emails via Gmail
- Logs all email sends to database
- Sends success notification back to backend

## 🚀 Setup Instructions

### 1. Update Your n8n Workflow
1. Import the new workflow from `n8n_campaign_with_success_notification.json`
2. Update credential IDs:
   - Replace `YOUR_SUPABASE_CREDENTIAL_ID` with your Supabase credential ID
   - Replace `YOUR_GMAIL_CREDENTIAL_ID` with your Gmail credential ID
   - Replace `YOUR_GEMINI_CREDENTIAL_ID` with your Gemini API credential ID

### 2. Database Setup
Run this SQL in your Supabase SQL editor:
```sql
-- Create email campaign logs table (if not exists)
CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR(255),
    campaign_name VARCHAR(255),
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_campaign_logs(status);
```

### 3. Start Your Services

#### Start FastAPI Backend
```bash
cd segmentationbackend
uvicorn main:app --reload --port 8000
```

#### Start Frontend
```bash
npm run dev
```

#### Start n8n (if not running)
```bash
n8n start
```

### 4. Test the Integration

#### Frontend Test
1. Open http://localhost:5173
2. Go to Message Generation page
3. Fill in:
   - **Campaign Name**: "Test Campaign" 
   - **Target Segment**: "Stable Earners"
   - **Bank Product**: "Auto Loan"
4. Click "Run Campaign"
5. Should show success popup after n8n processes

#### Direct Webhook Test
```bash
python test_campaign_trigger.py
```

## 📊 Data Flow

```
Frontend (React) 
    ↓ POST /webhook-test/campaign-trigger
n8n Workflow
    ↓ Fetch bank products from Supabase
    ↓ Fetch customers from segment table  
    ↓ Generate AI messages with Gemini
    ↓ Send emails via Gmail
    ↓ Log to email_campaign_logs
    ↓ POST /campaign-success
FastAPI Backend
    ↓ Log success notification
Frontend Success Popup
```

## 🔧 Required Data Structure

### Frontend sends to n8n:
```json
{
  "segment": "stable_earners",           // Table name
  "cluster_name": "Stable Earners",     // Display name  
  "product_name": "Auto Loan",          // Product to promote
  "campaign_name": "Summer Campaign"    // Campaign name
}
```

### n8n sends to backend success webhook:
```json
{
  "campaign_id": "Summer Campaign_stable_earners_1234567890",
  "campaign_name": "Summer Campaign", 
  "segment": "stable_earners",
  "cluster_name": "Stable Earners",
  "product_name": "Auto Loan",
  "emails_sent": 15,
  "status": "completed",
  "completed_at": "2025-09-06T10:30:00Z"
}
```

## 🎨 Frontend Features

### Campaign Setup Form
- **Campaign Name**: Text input (required)
- **Target Segment**: Dropdown with 5 segments + customer counts
- **Bank Product**: Dropdown filtered by selected segment (required)

### Run Campaign Button  
- Disabled until all fields filled
- Shows spinner: "Running Campaign..."
- Calls n8n webhook with campaign data

### Success Modal Popup
- Shows after successful n8n call
- Displays campaign name, product, segment
- Shows estimated customer count
- "Great!" button to close

## 🐛 Troubleshooting

### Frontend Issues
- **CORS Error**: Make sure n8n allows origins from localhost:5173
- **Network Error**: Check n8n is running on localhost:5678

### n8n Issues  
- **Credential Errors**: Verify Supabase, Gmail, Gemini credentials
- **Missing Tables**: Ensure all segment tables exist in Supabase
- **AI Generation Fails**: Check Gemini API key and rate limits

### Backend Issues
- **Port Conflicts**: Make sure FastAPI runs on port 8000
- **Supabase Connection**: Verify Supabase credentials in main.py

## 📈 Monitoring

### Email Campaign Logs
Monitor campaign performance in Supabase:
```sql
-- View recent campaigns
SELECT campaign_name, segment, COUNT(*) as emails_sent, 
       COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful
FROM email_campaign_logs 
WHERE sent_at > NOW() - INTERVAL '24 hours'
GROUP BY campaign_name, segment;
```

### n8n Execution Logs
- Go to n8n dashboard → Executions
- Monitor workflow runs and debug failures
- Check individual node outputs

## 🔄 Next Steps

### Enhanced Success Notification
To get real-time success notification in frontend:
1. Add WebSocket connection between frontend and backend
2. Backend forwards n8n success webhook to frontend via WebSocket
3. Frontend shows real-time campaign progress

### Advanced Features
- Campaign scheduling
- A/B testing different email templates  
- Customer engagement tracking
- Unsubscribe handling
- Email delivery status tracking

## 🛡️ Security Notes

- Use environment variables for API keys in production
- Enable proper CORS settings for production domains
- Implement rate limiting on webhook endpoints
- Add authentication for sensitive endpoints
