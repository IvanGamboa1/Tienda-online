import {
  exportApplicationServerKey,
  exportVapidKeys,
  generateVapidKeys
} from 'jsr:@negrel/webpush@0.5.0';

const keys = await generateVapidKeys({ extractable: true });

console.log(JSON.stringify({
  publicKey: await exportApplicationServerKey(keys),
  vapidJwk: await exportVapidKeys(keys)
}, null, 2));
