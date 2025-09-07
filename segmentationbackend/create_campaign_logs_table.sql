-- Create campaign_logs table to track email campaigns
CREATE TABLE IF NOT EXISTS campaign_logs (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) UNIQUE NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    segment_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_customers INTEGER,
    emails_sent INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaign_logs_status ON campaign_logs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_started_at ON campaign_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_campaign_logs_updated_at ON campaign_logs;
CREATE TRIGGER update_campaign_logs_updated_at
    BEFORE UPDATE ON campaign_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO campaign_logs (campaign_id, campaign_name, segment_name, product_name, status, total_customers, emails_sent, success_rate) 
VALUES 
    ('test_campaign_new_cautious_20250907', 'Test Campaign 1', 'New & Cautious', 'Fresh Start Card', 'completed', 150, 150, 98.67),
    ('welcome_series_stable_earners_20250906', 'Welcome Series', 'Stable Earners', 'Everyday Rewards Card', 'completed', 320, 318, 99.38),
    ('current_running_mid_tier_20250907', 'Current Running Campaign', 'Mid-Tier Professionals', 'Professional Platinum Card', 'running', 200, 0, NULL)
ON CONFLICT (campaign_id) DO NOTHING;
