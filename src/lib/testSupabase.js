import { supabase } from '@/lib/supabase';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test if we can reach Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};

// Test email signup
export const testEmailSignup = async (email, password, fullName) => {
  try {
    console.log('Testing email signup...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    console.log('Signup response:', { data, error });
    return { data, error };
  } catch (err) {
    console.error('Signup test failed:', err);
    return { data: null, error: err };
  }
};
