import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function normalizeAlphanumeric(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

// Mock list of fallback users matching the seed database
const MOCK_USERS_CHEOTNUN = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', email: 'admin@cheotnun.com', name: 'Super Administrador Cheotnun' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', email: 'cliente@example.com', name: 'Jaque Customer' }
];

function getRegistry(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cheotnun_registry');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToRegistry(entry: { email: string; phone?: string; document_number?: string }) {
  if (typeof window === 'undefined') return;
  try {
    const registry = getRegistry();
    registry.push(entry);
    localStorage.setItem('cheotnun_registry', JSON.stringify(registry));
  } catch { /* ignore */ }
}

const SESSION_COOKIE_NAME = 'cheotnun_session';

function setSessionCookie(data: any) {
  if (typeof window === 'undefined') return;
  try {
    const cookieValue = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${SESSION_COOKIE_NAME}=${cookieValue}; path=/; max-age=86400; SameSite=Lax`;
  } catch { /* ignore */ }
}

function clearSessionCookie() {
  if (typeof window === 'undefined') return;
  try {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch { /* ignore */ }
}

function saveSession(data: any) {
  localStorage.setItem(SESSION_COOKIE_NAME, JSON.stringify(data));
  setSessionCookie(data);
}

function clearSession() {
  localStorage.removeItem(SESSION_COOKIE_NAME);
  clearSessionCookie();
}

// Auth listener on client side to sync session to localStorage
if (typeof window !== 'undefined' && supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const email = session.user.email || '';
      
      const saved = localStorage.getItem('cheotnun_session');
      const currentUser = saved ? JSON.parse(saved) : null;
      
      if (!currentUser || currentUser.id !== session.user.id) {
        let dbUser: any = null;
        try {
          const { data } = await supabase
            .from('cheotnun_users')
            .select('name, phone, country, document_type, document_number, postal_code, street, number, complement, neighborhood, city, state')
            .eq('id', session.user.id)
            .maybeSingle();
          dbUser = data;
        } catch {
          // User not found in DB (e.g. first Google OAuth login) — use metadata from provider
        }

        const name = dbUser?.name || session.user.user_metadata?.name || email.split('@')[0];

        saveSession({
          id: session.user.id,
          email,
          name,
          role: 'customer',
          phone: dbUser?.phone || null,
          country: dbUser?.country || null,
          document_type: dbUser?.document_type || null,
          document_number: dbUser?.document_number || null,
          postal_code: dbUser?.postal_code || null,
          street: dbUser?.street || null,
          number: dbUser?.number || null,
          complement: dbUser?.complement || null,
          neighborhood: dbUser?.neighborhood || null,
          city: dbUser?.city || null,
          state: dbUser?.state || null,
          email_confirmed_at: session.user.email_confirmed_at || null,
        });
      } else if (currentUser && session.user.email_confirmed_at && !currentUser.email_confirmed_at) {
        // Email was just confirmed - update session with confirmation status
        const updated = { ...currentUser, email_confirmed_at: session.user.email_confirmed_at };
        saveSession(updated);
      }
    } else if (event === 'SIGNED_OUT') {
      clearSession();
    }
  });
}

export const authService = {
  async checkAvailability(fields: { email?: string; phone?: string; documentNumber?: string }): Promise<Record<string, boolean>> {
    const taken: Record<string, boolean> = {};
    if (supabase) {
      const checks: Promise<void>[] = [];
      const checkOne = async (column: string, value: string, key: string) => {
        try {
          const { data, error } = await supabase!.from('cheotnun_users').select(column).eq(column, value);
          if (error) {
            console.error('checkAvailability error:', error);
            return;
          }
          if (data && data.length > 0) {
            taken[key] = true;
          }
        } catch (e) {
          console.error('checkAvailability exception:', e);
        }
      };
      if (fields.email) checks.push(checkOne('email', fields.email.trim().toLowerCase(), 'email'));
      if (fields.phone) checks.push(checkOne('phone', normalizeAlphanumeric(fields.phone), 'phone'));
      if (fields.documentNumber) checks.push(checkOne('document_number', normalizeAlphanumeric(fields.documentNumber), 'documentNumber'));
      await Promise.all(checks);
      return taken;
    }
    // Fallback local: verifica registry persistente + sessão atual + mock users
    const allLocal = [...getRegistry(), ...MOCK_USERS_CHEOTNUN];
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cheotnun_session') : null;
    if (saved) allLocal.push(JSON.parse(saved));
    if (fields.email) {
      const cleanEmail = fields.email.trim().toLowerCase();
      taken.email = allLocal.some(u => u.email?.toLowerCase() === cleanEmail);
    }
    if (fields.phone) {
      const cleanPhone = normalizeAlphanumeric(fields.phone);
      taken.phone = allLocal.some(u => normalizeAlphanumeric(u.phone) === cleanPhone);
    }
    if (fields.documentNumber) {
      const cleanDoc = normalizeAlphanumeric(fields.documentNumber);
      taken.documentNumber = allLocal.some(u => normalizeAlphanumeric(u.document_number) === cleanDoc);
    }
    return taken;
  },

  async signUp(email: string, name: string, profileData?: Record<string, string>) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizeAlphanumeric(profileData?.phone);
    const cleanDoc = normalizeAlphanumeric(profileData?.documentNumber);

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: 'password123',
        options: {
          data: { 
            name, 
            ...profileData,
            phone: cleanPhone || null,
            documentNumber: cleanDoc || null
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined
        }
      });
      if (error) throw error;

      // Verificar se o usuário precisa confirmar e-mail
      if (data.user && !data.session) {
        // Usuário criado mas precisa confirmar e-mail - NÃO criar sessão
        console.log('Usuário criado, aguardando confirmação de e-mail:', data.user.email);
        return { user: data.user, requiresEmailConfirmation: true };
      }

      if (data.user && data.session) {
        // Usuário já confirmado (caso raro em produção)
        const insertResp = await fetch('/api/supabase-reload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upsert',
            table: 'users',
            records: [{
              id: data.user.id,
              email: cleanEmail,
              name,
              phone: cleanPhone || null,
              country: profileData?.country || null,
              document_type: profileData?.documentType || null,
              document_number: cleanDoc || null,
              postal_code: profileData?.postalCode || null,
              street: profileData?.street || null,
              number: profileData?.number || null,
              complement: profileData?.complement || null,
              neighborhood: profileData?.neighborhood || null,
              city: profileData?.city || null,
              state: profileData?.state || null,
            }]
          }),
        });
        const insertResult = await insertResp.json();
        if (!insertResult.success) {
          console.error('Error inserting user profile via API:', insertResult.error);
          throw new Error(insertResult.error || 'Error inserting user profile');
        } else {
          saveToRegistry({ email: cleanEmail, phone: cleanPhone, document_number: cleanDoc });
        }

        saveSession({
          id: data.user.id,
          email: cleanEmail,
          name,
          role: 'customer',
          country: profileData?.country || null,
          phone: cleanPhone || null,
          document_type: profileData?.documentType || null,
          document_number: cleanDoc || null,
          email_confirmed_at: data.user.email_confirmed_at || null,
        });
      }
      return data;
    } else {
      const newUser = {
        id: crypto.randomUUID(), email: cleanEmail, name, role: 'customer',
        ...(profileData?.country && { country: profileData.country }),
        ...(cleanPhone && { phone: cleanPhone }),
        ...(profileData?.documentType && { document_type: profileData.documentType }),
        ...(cleanDoc && { document_number: cleanDoc }),
        ...(profileData?.postalCode && { postal_code: profileData.postalCode }),
        ...(profileData?.street && { street: profileData.street }),
        ...(profileData?.number && { number: profileData.number }),
        ...(profileData?.complement && { complement: profileData.complement }),
        ...(profileData?.neighborhood && { neighborhood: profileData.neighborhood }),
        ...(profileData?.city && { city: profileData.city }),
        ...(profileData?.state && { state: profileData.state }),
      };
      saveSession(newUser);
      saveToRegistry({ email: cleanEmail, phone: cleanPhone, document_number: cleanDoc });
      return { user: newUser };
    }
  },

  async signIn(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: 'password123'
      });
      if (error) throw error;

      if (data.user) {
        // Verificar se o e-mail está confirmado
        if (!data.user.email_confirmed_at) {
          // E-mail não confirmado - fazer logout e lançar erro
          await supabase.auth.signOut();
          throw new Error('EMAIL_NOT_CONFIRMED');
        }

        const { data: dbUser } = await supabase
          .from('cheotnun_users')
          .select('name, phone, country, document_type, document_number, postal_code, street, number, complement, neighborhood, city, state')
          .eq('id', data.user.id)
          .single();

        const name = dbUser?.name || data.user.user_metadata?.name || cleanEmail.split('@')[0];

        saveSession({
          id: data.user.id,
          email: cleanEmail,
          name,
          role: 'customer',
          phone: dbUser?.phone || null,
          country: dbUser?.country || null,
          document_type: dbUser?.document_type || null,
          document_number: dbUser?.document_number || null,
          postal_code: dbUser?.postal_code || null,
          street: dbUser?.street || null,
          number: dbUser?.number || null,
          complement: dbUser?.complement || null,
          neighborhood: dbUser?.neighborhood || null,
          city: dbUser?.city || null,
          state: dbUser?.state || null,
          email_confirmed_at: data.user.email_confirmed_at,
        });
      }
      return data;
    } else {
      // Local fallback search matching seed list
      const matched = MOCK_USERS_CHEOTNUN.find(u => u.email.toLowerCase() === cleanEmail);
      const userSession = matched ? { ...matched, role: 'customer' } : { id: crypto.randomUUID(), email: cleanEmail, name: cleanEmail.split('@')[0], role: 'customer' };
      saveSession(userSession);
      return { user: userSession };
    }
  },

  async signInWithGoogle() {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
      return data;
    } else {
      // Local fallback simulator for Google OAuth button
      const googleUser = { id: crypto.randomUUID(), email: 'google.user@gmail.com', name: 'Google Client User', role: 'customer' };
      saveSession(googleUser);
      return { user: googleUser };
    }
  },

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('cheotnun_session');
    return saved ? JSON.parse(saved) : null;
  },

  async getCurrentUserFromSupabase() {
    if (!supabase) return null;
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  isEmailConfirmed() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Verificar se email_confirmed_at existe e é válido
    return !!(user.email_confirmed_at && user.email_confirmed_at !== null);
  },
};

