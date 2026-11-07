# Configurar notificaciones push de K1KO

Este flujo envía **“K1KO: nuevo pedido”** aunque el panel esté cerrado. Solo avisa por pedidos creados después de instalar la configuración. Los pedidos existentes no generan alertas retroactivas.

## Estado actual

El backend de Supabase del proyecto `k1ko-store` ya está configurado: secretos privados guardados, funciones desplegadas, tabla privada creada y trigger de nuevos pedidos activo. **No vuelvas a ejecutar el SQL ni regeneres las claves VAPID.**

Para terminar, publica la versión actualizada de los archivos del sitio y activa las notificaciones desde el panel en cada dispositivo. Las instrucciones siguientes son referencia para recuperar o reconstruir el backend; no son pasos pendientes para esta instalación.

## 1. Generar las claves VAPID

Instala Deno si no está instalado y, desde la raíz de este proyecto, ejecuta:

```powershell
deno run --allow-net=jsr.io scripts/generate-vapid-keys.ts
```

Guarda el resultado en un lugar privado. No publiques ni compartas `vapidJwk.privateKey`.

## 2. Guardar los secretos de las Edge Functions

En Supabase abre **Project Settings → Edge Functions → Secrets** y añade:

| Nombre | Valor |
|---|---|
| `PUSH_VAPID_PUBLIC_KEY` | El valor `publicKey` de la salida anterior |
| `PUSH_VAPID_JWK` | El objeto completo `vapidJwk` de la salida, en una sola línea JSON |
| `PUSH_VAPID_SUBJECT` | Un correo de contacto, por ejemplo `mailto:tu-correo@ejemplo.com` |
| `PUSH_WEBHOOK_SECRET` | Un secreto aleatorio largo, por ejemplo 64 caracteres hexadecimales |

Supabase proporciona `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a las funciones. **Nunca** pongas la service-role key ni la clave VAPID privada en el sitio web, en este documento o en SQL.

Genera un secreto aleatorio para `PUSH_WEBHOOK_SECRET`, por ejemplo con:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Usa exactamente el mismo valor en el paso SQL siguiente. No lo compartas ni lo subas a Git.

## 3. Crear la tabla y el disparador SQL

En Supabase abre **SQL Editor → New query**. Abre [`supabase/push-notifications-setup.sql`](./supabase/push-notifications-setup.sql), copia su contenido y pégalo en el editor.

Antes de ejecutar, reemplaza:

```text
REEMPLAZAR_POR_EL_MISMO_SECRETO_PUSH_WEBHOOK_SECRET
```

por el valor de `PUSH_WEBHOOK_SECRET` que guardaste en el paso 2. El SQL crea la tabla privada para suscripciones, guarda la URL y el secreto en Vault, y añade el trigger para nuevos pedidos. Si Supabase indica que Vault no está activo, habilita **Vault** desde **Database → Extensions** y vuelve a ejecutar el SQL.

**Ejecuta el SQL una sola vez.** Crear las credenciales de Vault otra vez puede dejar entradas duplicadas; si ya lo ejecutaste por error, no repitas el bloque de `vault.create_secret`.

## 4. Desplegar las Edge Functions

Instala Supabase CLI si hace falta, inicia sesión y vincula este proyecto al proyecto correcto:

```powershell
supabase login
supabase link --project-ref oasuoihjkoaaxajwjleo
supabase functions deploy register-push-subscription
supabase functions deploy push-new-order
```

El archivo [`supabase/config.toml`](./supabase/config.toml) desactiva la comprobación JWT del webhook **solo** para `push-new-order`; esa función valida el secreto privado que se guarda en Vault. `register-push-subscription` mantiene la validación JWT para exigir una sesión de administrador.

## 5. Publicar y activar en el dispositivo del admin

Publica también los cambios del sitio. Abre el panel desde su URL HTTPS, inicia sesión, ve a **Pedidos**, pulsa **Activar notificaciones** y permite las notificaciones. Haz este paso en cada dispositivo/navegador donde quieras recibir alertas. En iPhone/iPad, instala primero la PWA desde Safari y ábrela desde el icono instalado.

La PWA puede mostrar la notificación sin que el panel esté abierto, pero la entrega también depende de que el sistema operativo y el navegador permitan notificaciones en segundo plano.

## Prueba

Con el admin suscrito, crea un pedido de prueba desde la tienda. Debe aparecer **K1KO: nuevo pedido** en el dispositivo. Para revisar errores, consulta **Edge Functions → Logs** y **Database → Logs** en Supabase.

El mensaje solo incluye nombre del cliente y total; no expone en la notificación pública el celular, la dirección ni los productos.
