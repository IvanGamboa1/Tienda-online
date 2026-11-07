import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return jsonResponse({ error: 'Se requiere una sesión de administrador.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('PUSH_VAPID_PUBLIC_KEY');
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey) {
    console.error('Falta configurar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o PUSH_VAPID_PUBLIC_KEY.');
    return jsonResponse({ error: 'Falta configuración del servidor de notificaciones.' }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse({ error: 'La sesión de administrador no es válida.' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'El cuerpo de la solicitud debe ser JSON válido.' }, 400);
  }

  if (body.action === 'getPublicKey') {
    return jsonResponse({ publicKey: vapidPublicKey });
  }

  if (body.action !== 'saveSubscription' || !body.subscription || typeof body.subscription !== 'object') {
    return jsonResponse({ error: 'Acción o suscripción no válida.' }, 400);
  }

  const subscription = body.subscription as {
    endpoint?: unknown;
    keys?: { auth?: unknown; p256dh?: unknown };
  };
  const endpoint = subscription.endpoint;
  const authKey = subscription.keys?.auth;
  const p256dhKey = subscription.keys?.p256dh;
  if (typeof endpoint !== 'string' || typeof authKey !== 'string' || typeof p256dhKey !== 'string') {
    return jsonResponse({ error: 'La suscripción push está incompleta.' }, 400);
  }

  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    return jsonResponse({ error: 'El endpoint de notificaciones no es válido.' }, 400);
  }
  if (endpointUrl.protocol !== 'https:') {
    return jsonResponse({ error: 'El endpoint debe usar HTTPS.' }, 400);
  }

  const { error: saveError } = await adminClient
    .from('push_subscriptions')
    .upsert({
      user_id: userData.user.id,
      endpoint,
      subscription: { endpoint, keys: { auth: authKey, p256dh: p256dhKey } }
    }, { onConflict: 'endpoint' });

  if (saveError) {
    console.error('No se pudo guardar una suscripción push:', saveError.message);
    return jsonResponse({ error: 'No se pudo guardar la suscripción en Supabase.' }, 500);
  }

  return jsonResponse({ ok: true });
});
