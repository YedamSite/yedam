import { supabase } from './supabaseAuth';

export async function saveNewsletterSubscriberToSupabase(email: string, name: string = '', source: string = 'homepage') {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return { success: false, error: 'Supabase not configured' };
    }

    // Check if email already exists
    const { data: existing, error: fetchError } = await supabase
      .from('yedam_newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking existing subscriber:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      console.log('Subscriber already exists:', email);
      return { success: true, message: 'Subscriber already exists' };
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('yedam_newsletter_subscribers')
      .insert({
        email,
        name: name || '',
        source,
        status: 'active',
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Subscriber saved to Supabase:', email);
    return { success: true, message: 'Subscriber saved successfully' };
  } catch (error: any) {
    console.error('Unexpected error saving subscriber:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function deleteNewsletterSubscriberFromSupabase(id: string) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('yedam_newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscriber:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Subscriber deleted successfully' };
  } catch (error: any) {
    console.error('Unexpected error deleting subscriber:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function getNewsletterSubscribersFromSupabase() {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured', data: [] };
    }

    const { data, error } = await supabase
      .from('yedam_newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscribers:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching subscribers:', error);
    return { success: false, error: error.message || 'Unknown error', data: [] };
  }
}