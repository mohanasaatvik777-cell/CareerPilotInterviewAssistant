const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseKey &&
  supabaseKey.length > 10 &&
  !supabaseUrl.includes('your-supabase-project')
);

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('⚡ Connected to Supabase PostgreSQL database.');
  } catch (err) {
    console.warn('Failed to connect to Supabase:', err.message);
  }
} else {
  console.log('ℹ️ Supabase environment variables not configured yet. Using local fallback persistence engine.');
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
