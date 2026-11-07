import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  ApplicationServer,
  type ExportedVapidKeys,
  importVapidKeys,
  PushMessageError,
  Urgency
} from 'jsr:@negrel/webpush@0.5.0';

type OrderWebhook = {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    order_id?: string;
    cliente?: string;
    total?: number | string;
  };
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

Deno.serve(async request => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const expectedSecret = Deno.env.get('PUSH_WEBHOOK_SECRET');
  const receivedSecret = request.headers.get('x-push-webhook-secret') || '';
  if (!expectedSecret || !timingSafeEqual(receivedSecret, expectedSecret)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let webhook: OrderWebhook;
  try {
    webhook = await request.json();
  } catch {
    return jsonResponse({ error: 'El cuerpo de la solicitud debe ser JSON válido.' }, 400);
  }

  if (webhook.type !== 'INSERT' || webhook.schema !== 'public' || webhook.table !== 'orders' || !webhook.record) {
    return jsonResponse({ error: 'Evento de base de datos no admitido.' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const exportedVapidKeys = Deno.env.get('PUSH_VAPID_JWK');
  const vapidSubject = Deno.env.get('PUSH_VAPID_SUBJECT');
  if (!supabaseUrl || !serviceRoleKey || !exportedVapidKeys || !vapidSubject) {
    console.error('Falta configuración del servidor para enviar notificaciones push.');
    return jsonResponse({ error: 'Falta configuración del servidor de notificaciones.' }, 500);
  }

  let vapidKeys: CryptoKeyPair;
  try {
    const parsedKeys = JSON.parse(exportedVapidKeys) as ExportedVapidKeys;
    vapidKeys = await importVapidKeys(parsedKeys);
  } catch (error) {
    console.error('La clave privada VAPID no se pudo importar:', error);
    return jsonResponse({ error: 'La clave privada VAPID no tiene un formato válido.' }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: subscriptions, error: queryError } = await adminClient
    .from('push_subscriptions')
    .select('endpoint, subscription');

  if (queryError) {
    console.error('No se pudieron leer las suscripciones push:', queryError.message);
    return jsonResponse({ error: 'No se pudieron consultar las suscripciones.' }, 500);
  }
  if (!subscriptions?.length) return jsonResponse({ sent: 0, expired: 0 });

  const applicationServer = await ApplicationServer.new({
    contactInformation: vapidSubject,
    vapidKeys
  });
  const order = webhook.record;
  const total = Number(order.total) || 0;
  const message = JSON.stringify({
    title: 'K1KO: nuevo pedido',
    body: `${order.cliente || 'Un cliente'} · $${total.toLocaleString('es-CO')} COP`,
    tag: `k1ko-${order.order_id || 'pedido'}`,
    url: './admin.html'
  });

  const results = await Promise.allSettled(subscriptions.map(async row => {
    try {
      await applicationServer.subscribe(row.subscription).pushTextMessage(message, {
        urgency: Urgency.High,
        ttl: 86400
      });
      return 'sent' as const;
    } catch (error) {
      if (error instanceof PushMessageError && (error.response.status === 404 || error.response.status === 410)) {
        const { error: deleteError } = await adminClient
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', row.endpoint);
        if (deleteError) console.error('No se pudo limpiar una suscripción vencida:', deleteError.message);
        return 'expired' as const;
      }

      console.error('Falló el envío de una notificación push:', error);
      return 'failed' as const;
    }
  }));

  const counts = results.reduce((summary, result) => {
    if (result.status === 'fulfilled') summary[result.value] += 1;
    else summary.failed += 1;
    return summary;
  }, { sent: 0, expired: 0, failed: 0 });

  return jsonResponse(counts);
});
