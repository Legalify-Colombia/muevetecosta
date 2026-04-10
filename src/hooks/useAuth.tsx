
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const recoveringProfileIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('Setting up auth state listener');

    const loadProfile = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
          return;
        }

        if (profileData) {
          console.log('Profile loaded:', profileData);
          setProfile(profileData);
          recoveringProfileIds.current.delete(userId);
          return;
        }

        if (recoveringProfileIds.current.has(userId)) {
          setProfile(null);
          return;
        }

        console.warn('Profile not found for user, attempting to create...');
        recoveringProfileIds.current.add(userId);

        try {
          const { data: result, error: createError } = await supabase
            .rpc('create_missing_profile', { p_user_id: userId });

          if (createError) {
            console.error('Error creating missing profile:', createError);
            setProfile(null);
            return;
          }

          console.log('Profile recovery result:', result);

          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (retryError) {
            console.error('Error fetching recovered profile:', retryError);
            setProfile(null);
            return;
          }

          setProfile(retryData ?? null);
        } catch (rpcErr) {
          console.error('Error calling create_missing_profile RPC:', rpcErr);
          setProfile(null);
        } finally {
          recoveringProfileIds.current.delete(userId);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
        setProfile(null);
        recoveringProfileIds.current.delete(userId);
      }
    };
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to avoid deadlocks when fetching profile
        if (session?.user) {
          console.log('User logged in, scheduling profile fetch');
          setTimeout(async () => {
            await loadProfile(session.user.id);
          }, 100);
        } else {
          console.log('User logged out');
          setProfile(null);
          recoveringProfileIds.current.clear();
        }
        
        setLoading(false);
      }
    );

    // Check for existing session AFTER setting up listener
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id, error);
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        // Don't manually update state here - let the listener handle it
        // This prevents duplicate state updates
        if (!session) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    
    // If signup was successful, update profile with full data and populate student_info
    if (!error && data.user) {
      try {
        // Update profile with complete metadata
        const { error: updateError } = await supabase.rpc('update_profile_from_auth_user', {
          p_user_id: data.user.id
        });
        
        if (updateError) {
          console.warn('Warning: Could not update profile metadata:', updateError);
        } else {
          console.log('Profile updated with full metadata');
        }
        
        // If user is a student, also populate student_info
        if (userData.role === 'student') {
          try {
            const { error: populateError } = await supabase.rpc('populate_student_info', {
              p_user_id: data.user.id,
              p_origin_university: userData.origin_university || 'Not specified',
              p_academic_program: userData.academic_program || 'Not specified',
              p_current_semester: parseInt(userData.current_semester || '1')
            });
            
            if (populateError) {
              console.warn('Warning: Could not populate student info:', populateError);
            } else {
              console.log('Student info populated successfully');
            }
          } catch (err) {
            console.warn('Warning: Exception populating student info:', err);
          }
        }
      } catch (err) {
        console.warn('Warning: Exception updating profile:', err);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('Sign in result:', error);
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        console.log('Successfully signed out');
        // Clear all state immediately
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Unexpected error during signout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
