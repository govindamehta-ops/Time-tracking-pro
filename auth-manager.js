// Authentication Manager
// lib/auth-manager.js

// Auth functions for TimeTracker Pro
class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.currentUser = null;
    this.currentSession = null;
  }

  // Email/Password Authentication
  async signUp(email, password, userData = {}) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pages/auth-callback.html`,
        data: {
          name: userData.name || '',
          department: userData.department || '',
          role: userData.role || 'Employee'
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    return data;
  }

  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    this.currentUser = data.user;
    this.currentSession = data.session;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }

    this.currentUser = null;
    this.currentSession = null;
  }

  // Password Reset
  async resetPassword(email) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/pages/reset-password.html`
    });

    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }

  // GitHub OAuth (optional)
  async signInWithGitHub() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/pages/auth-callback.html`
      }
    });

    if (error) {
      console.error('GitHub OAuth error:', error);
      throw error;
    }

    return data;
  }

  // Profile Management
  async getProfile(userId) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return data;
  }

  async updateProfile(userId, updates) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      throw error;
    }

    return data;
  }

  async createProfile(userId, profileData) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([{
        id: userId,
        ...profileData
      }])
      .select()
      .single();

    if (error) {
      console.error('Create profile error:', error);
      throw error;
    }

    return data;
  }

  // Session Management
  async getCurrentSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    this.currentSession = session;
    this.currentUser = session?.user || null;
    return session;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    this.currentUser = user;
    return user;
  }

  // Auth State Management
  setupAuthListener(callback) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      // Handle profile creation on sign up
      if (event === 'SIGNED_IN' && session?.user) {
        await this.ensureProfile(session.user);
      }
      
      callback(event, session);
    });
  }

  // Ensure user has a profile
  async ensureProfile(user) {
    const existingProfile = await this.getProfile(user.id);
    
    if (!existingProfile) {
      const profileData = {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        department: user.user_metadata?.department || 'General',
        role: user.user_metadata?.role || 'Employee',
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      await this.createProfile(user.id, profileData);
    }
  }

  // Route Protection
  async requireAuth() {
    const session = await this.getCurrentSession();
    if (!session?.user) {
      window.location.href = '/pages/auth.html';
      return false;
    }
    return true;
  }

  // Utility Methods
  isAuthenticated() {
    return !!(this.currentSession?.user);
  }

  getUserId() {
    return this.currentUser?.id || null;
  }

  getUserEmail() {
    return this.currentUser?.email || null;
  }
}

// Export for ES modules and global access
export default AuthManager;
window.AuthManager = AuthManager;