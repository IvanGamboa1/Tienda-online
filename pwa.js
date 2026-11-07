let installPrompt = null;
const installButtons = [...document.querySelectorAll('[data-pwa-install]')];
const installHints = [...document.querySelectorAll('[data-pwa-install-hint]')];
const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
const installStateKey = `k1ko:pwa-installed:${document.querySelector('link[rel="manifest"]')?.href || window.location.pathname}`;
const standaloneMode = window.matchMedia('(display-mode: standalone)');

function isRunningAsInstalledApp() {
  return standaloneMode.matches || window.navigator.standalone === true;
}

function readInstalledState() {
  try {
    return window.localStorage.getItem(installStateKey) === 'true';
  } catch (error) {
    console.error('No se pudo leer el estado de instalación de K1KO:', error);
    return false;
  }
}

function saveInstalledState(installed) {
  try {
    if (installed) {
      window.localStorage.setItem(installStateKey, 'true');
    } else {
      window.localStorage.removeItem(installStateKey);
    }
  } catch (error) {
    console.error('No se pudo guardar el estado de instalación de K1KO:', error);
  }
}

let appIsInstalled = isRunningAsInstalledApp() || readInstalledState();

function updateInstallButtons() {
  installButtons.forEach(button => { button.hidden = appIsInstalled; });
}

function showInstallHint(message) {
  installHints.forEach(hint => {
    hint.textContent = message;
    hint.hidden = false;
  });
}

function showIosInstallGuide() {
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') {
    showInstallHint('En Safari, toca Compartir y selecciona “Añadir a pantalla de inicio” para instalar K1KO.');
    return;
  }

  dialog.className = 'pwa-install-dialog';
  dialog.setAttribute('aria-labelledby', 'pwa-install-title');

  const title = document.createElement('h2');
  title.id = 'pwa-install-title';
  title.textContent = 'Instalar K1KO en tu iPhone o iPad';

  const steps = document.createElement('ol');
  [
    'Abre esta página en Safari y toca el botón Compartir (el cuadro con la flecha hacia arriba).',
    'Desplázate por las opciones y selecciona “Añadir a pantalla de inicio”.',
    'Toca “Añadir” para instalar K1KO en tu dispositivo.'
  ].forEach(text => {
    const step = document.createElement('li');
    step.textContent = text;
    steps.append(step);
  });

  const note = document.createElement('p');
  note.textContent = 'Apple no permite que una página web se instale automáticamente; este es el paso requerido por iOS.';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'pwa-install-dialog-close';
  closeButton.textContent = 'Entendido';
  closeButton.addEventListener('click', () => dialog.close());

  dialog.append(title, steps, note, closeButton);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
}

function showUnavailableMessage() {
  const userAgent = window.navigator.userAgent;
  const message = /android/i.test(userAgent)
    ? 'Para instalar en Android, abre esta página directamente en Chrome (no dentro de WhatsApp o Instagram) y elige ⋮ > “Instalar aplicación” o “Añadir a pantalla de inicio”. Si no aparece, comprueba que la dirección use HTTPS y vuelve a cargar la página.'
    : /iphone|ipad|ipod/i.test(userAgent)
      ? 'Abre esta página en Safari y usa Compartir > “Añadir a pantalla de inicio”.'
      : 'La instalación directa no está disponible aquí. Abre K1KO en Chrome o Edge desde su menú de instalación y comprueba que la dirección use HTTPS.';
  showInstallHint(message);
}

updateInstallButtons();

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  if (!isRunningAsInstalledApp()) {
    saveInstalledState(false);
    appIsInstalled = false;
    updateInstallButtons();
  }
});

installButtons.forEach(button => button.addEventListener('click', async () => {
  if (isIos) {
    showIosInstallGuide();
    return;
  }

  if (!installPrompt) {
    showUnavailableMessage();
    return;
  }

  try {
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null;
    if (outcome === 'accepted') showInstallHint('K1KO se está instalando.');
  } catch (error) {
    installPrompt = null;
    console.error('No se pudo iniciar la instalación de K1KO:', error);
    showInstallHint('No se pudo iniciar la instalación. Comprueba tu conexión e inténtalo de nuevo.');
  }
}));

window.addEventListener('appinstalled', () => {
  saveInstalledState(true);
  appIsInstalled = true;
  updateInstallButtons();
  showInstallHint('K1KO quedó instalada en tu dispositivo.');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(error => console.error('No se pudo registrar el service worker:', error));
  });
}
