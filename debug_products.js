import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxuyhqnkdrzgiwkohvug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dXlocW5rZHJ6Z2l3a29odnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1NTQ0MDYsImV4cCI6MjA0NTEzMDQwNn0.hKz6tpCMY6fJaT-I-x3FgH8VBgGwYJQ1KjA-Uj-Kflo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBankProducts() {
  try {
    // Get all products to see what cluster names exist
    const { data, error } = await supabase
      .from('bank_products')
      .select('cluster_name, product_name')
      .order('cluster_name');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('All products in database:');
    data.forEach(product => {
      console.log(`Cluster: "${product.cluster_name}" | Product: "${product.product_name}"`);
    });
    
    // Get unique cluster names
    const uniqueClusters = [...new Set(data.map(p => p.cluster_name))];
    console.log('\nUnique cluster names:');
    uniqueClusters.forEach(cluster => {
      console.log(`"${cluster}"`);
    });
    
    // Test specific query for Mid-Tier Professionals
    console.log('\n--- Testing query for "3. Mid-Tier Professionals" ---');
    const { data: midTierData, error: midTierError } = await supabase
      .from('bank_products')
      .select('*')
      .eq('cluster_name', '3. Mid-Tier Professionals');
    
    console.log('Mid-tier results:', midTierData?.length || 0, 'products');
    if (midTierData?.length > 0) {
      console.log('Sample product:', midTierData[0]);
    }
    
  } catch (err) {
    console.error('Error checking bank products:', err);
  }
}

checkBankProducts();
