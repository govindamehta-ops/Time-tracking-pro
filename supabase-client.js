// Supabase Client Configuration
// lib/supabase-client.js

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.38.0';

// Environment variables (will be replaced at build time or loaded from .env)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 
  window.VITE_SUPABASE_URL || 
  'https://your-project-ref.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  window.VITE_SUPABASE_ANON_KEY || 
  'your-anon-key-here';

// Create Supabase client with auth configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Enable auto refresh of tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL on callback pages
    detectSessionInUrl: true,
    // Storage key prefix
    storageKey: 'timetracker-auth',
    // Email confirmation and password reset flows
    redirectTo: `${window.location.origin}/pages/auth-callback.html`
  }
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to get session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getSession();
  return !!session?.user;
};

// Auth event listener setup
export const setupAuthListener = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    callback(event, session);
  });
};

// Export for global access (for vanilla JS)
window.supabase = supabase;
window.getCurrentUser = getCurrentUser;
window.getSession = getSession;
window.isAuthenticated = isAuthenticated;
window.setupAuthListener = setupAuthListener;