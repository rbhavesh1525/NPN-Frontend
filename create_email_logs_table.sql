-- Create email_campaign_logs table in Supabase
-- Run this SQL in your Supabase SQL editor

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
    status VARCHAR(50) DEFAULT 'pending', -- 'sent', 'failed', 'pending'
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer_email ON email_campaign_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_campaign_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_campaign_logs(sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE email_campaign_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON email_campaign_logs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON email_campaign_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON email_campaign_logs
    FOR UPDATE USING (true);
