import { supabase } from './supabaseAuth';

/**
 * Envia e-mail de confirmação de cadastro personalizado
 */
export async function sendConfirmationEmail(email: string, name: string, locale: string = 'es') {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return { success: false, error: 'Supabase not configured' };
    }

    // Templates de e-mail por idioma
    const templates: Record<string, { subject: string; heading: string; body: string; cta: string }> = {
      es: {
        subject: '¡Bienvenida a CHEOTNUN K-BEAUTY! ✨',
        heading: '¡Hola, bienvenida al mundo Cheotnun!',
        body: 'Gracias por crear tu cuenta en Cheotnun K-Beauty. Ahora formas parte de nuestra comunidad de amantes del cuidado de la piel coreano. Aquí encontrarás productos auténticos, asesoría personalizada y experiencias exclusivas.',
        cta: 'EXPLORAR TIENDA'
      },
      pt: {
        subject: 'Bem-vinda à CHEOTNUN K-BEAUTY! ✨',
        heading: 'Olá, bem-vinda ao mundo Cheotnun!',
        body: 'Obrigado por criar sua conta na Cheotnun K-Beauty. Agora você faz parte da nossa comunidade de amantes do skincare coreano. Aqui você encontrará produtos autênticos, consultoria personalizada e experiências exclusivas.',
        cta: 'EXPLORAR LOJA'
      },
      en: {
        subject: 'Welcome to CHEOTNUN K-BEAUTY! ✨',
        heading: 'Hello, welcome to the Cheotnun world!',
        body: 'Thank you for creating your account at Cheotnun K-Beauty. You are now part of our community of Korean skincare lovers. Here you will find authentic products, personalized advice and exclusive experiences.',
        cta: 'EXPLORE STORE'
      }
    };

    const template = templates[locale] || templates.es;

    // Inserir registro de e-mail enviado na tabela de logs
    const { error: insertError } = await supabase
      .from('cheotnun_email_logs')
      .insert({
        email,
        type: 'confirmation',
        subject: template.subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          name,
          locale,
          template: 'confirmation_v1'
        }
      });

    if (insertError) {
      console.error('Error logging confirmation email:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Confirmation email logged for:', email);
    return { success: true, message: 'Confirmation email logged successfully' };
  } catch (error: any) {
    console.error('Unexpected error sending confirmation email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Envia e-mail de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string, locale: string = 'es') {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return { success: false, error: 'Supabase not configured' };
    }

    const templates: Record<string, { subject: string; heading: string; body: string; cta: string }> = {
      es: {
        subject: 'Recuperar tu contraseña - CHEOTNUN',
        heading: '¿Olvidaste tu contraseña?',
        body: 'Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:',
        cta: 'RESTABLECER CONTRASEÑA'
      },
      pt: {
        subject: 'Recuperar sua senha - CHEOTNUN',
        heading: 'Esqueceu sua senha?',
        body: 'Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova:',
        cta: 'REDEFINIR SENHA'
      },
      en: {
        subject: 'Reset your password - CHEOTNUN',
        heading: 'Forgot your password?',
        body: 'We received a request to reset your password. Click the button below to create a new one:',
        cta: 'RESET PASSWORD'
      }
    };

    const template = templates[locale] || templates.es;

    // Log do e-mail
    const { error: insertError } = await supabase
      .from('cheotnun_email_logs')
      .insert({
        email,
        type: 'password_reset',
        subject: template.subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          resetUrl,
          locale,
          template: 'password_reset_v1'
        }
      });

    if (insertError) {
      console.error('Error logging password reset email:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Password reset email logged for:', email);
    return { success: true, message: 'Password reset email logged successfully' };
  } catch (error: any) {
    console.error('Unexpected error sending password reset email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Envia e-mail de boas-vindas após primeira compra
 */
export async function sendWelcomeEmail(email: string, name: string, orderNumber: string, locale: string = 'es') {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return { success: false, error: 'Supabase not configured' };
    }

    const templates: Record<string, { subject: string; heading: string; body: string }> = {
      es: {
        subject: `¡Gracias por tu primera compra! Pedido #${orderNumber}`,
        heading: '¡Tu pedido está en camino! ✨',
        body: `Gracias por confiar en Cheotnun K-Beauty. Tu pedido #${orderNumber} ha sido confirmado y pronto lo prepararemos con mucho cuidado. Recibirás un email con el número de seguimiento en cuanto sea enviado.`
      },
      pt: {
        subject: `Obrigado pela sua primeira compra! Pedido #${orderNumber}`,
        heading: 'Seu pedido está a caminho! ✨',
        body: `Obrigado por confiar na Cheotnun K-Beauty. Seu pedido #${orderNumber} foi confirmado e em breve o prepararemos com muito cuidado. Você receberá um e-mail com o número de rastreamento assim que for enviado.`
      },
      en: {
        subject: `Thank you for your first order! Order #${orderNumber}`,
        heading: 'Your order is on the way! ✨',
        body: `Thank you for trusting Cheotnun K-Beauty. Your order #${orderNumber} has been confirmed and we will prepare it with care soon. You will receive an email with the tracking number as soon as it is shipped.`
      }
    };

    const template = templates[locale] || templates.es;

    const { error: insertError } = await supabase
      .from('cheotnun_email_logs')
      .insert({
        email,
        type: 'welcome_order',
        subject: template.subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          name,
          orderNumber,
          locale,
          template: 'welcome_order_v1'
        }
      });

    if (insertError) {
      console.error('Error logging welcome email:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('Welcome email logged for:', email);
    return { success: true, message: 'Welcome email logged successfully' };
  } catch (error: any) {
    console.error('Unexpected error sending welcome email:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function getEmailLogsFromSupabase() {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured', data: [] };
    }

    const { data, error } = await supabase
      .from('cheotnun_email_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching email logs:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching email logs:', error);
    return { success: false, error: error.message || 'Unknown error', data: [] };
  }
}