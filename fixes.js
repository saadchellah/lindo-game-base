/* Touches fix */

/**
 * @param {Record<string, { title: string, messages: string[] }>} texts
 * @param {{ url: string, text: string }} link
 */
async function sendPopup(texts, link) {
  const languagesInitialized = new Promise(resolve => {
    const interval = setInterval(() => {
      if (window.Config && window.Config.language) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  const lindoLogoLoaded = new Promise(resolve => {
    const lindoLogo = new Image();
    lindoLogo.addEventListener('load', resolve);
    lindoLogo.src = "https://lindo-app.com/icon.png";
  });

  await Promise.all([
    languagesInitialized,
    lindoLogoLoaded
  ]);

  const translatedTexts = texts[window.Config.language] || texts['en'] || texts[Object.keys(texts)[0]];

  window.gui.openSimplePopup(`
    <div>
      ${translatedTexts.messages.join('<br />')}<br />
      <a target="_blank" href="${link.url}" style="text-align: center; font-size: 1.2em; display: inline-block; width: 100%; margin-top: 0.4em; text-decoration: none;">
        <img src="https://lindo-app.com/icon.png" style="height: 1.2em; display: inline-block; vertical-align: middle;"/>
        <span style="vertical-align: middle;">${link.text}</span>
      </a>
    </div>
  `, translatedTexts.title);

  return translatedTexts
}

// 🔥 CRITICAL: Device fingerprint spoofing (BEFORE game initializes)
(function() {
  console.log('[Lindo] Applying device fingerprint spoofing...');

  // 🔥 FIX #1: Add navigator.deviceMemory (CRITICAL - was missing)
  if (!('deviceMemory' in navigator)) {
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 6, // 6GB RAM
      configurable: true,
      enumerable: true
    });
  }

  // 🔥 FIX #2: Override navigator.hardwareConcurrency
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8, // 8 cores
    configurable: true,
    enumerable: true
  });

  // 🔥 FIX #3: Add connection type (was missing)
  if (!navigator.connection) {
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        type: 'wifi'
      }),
      configurable: true,
      enumerable: true
    });
  }

  // 🔥 FIX #4: Spoof WebGL to match mobile GPU
  (function spoofWebGL() {
    const getParam = WebGLRenderingContext.prototype.getParameter;
    const getParam2 = WebGL2RenderingContext?.prototype?.getParameter;
    
    const spoofHandler = function(parameter) {
      // UNMASKED_VENDOR_WEBGL (37445)
      if (parameter === 37445) return 'Qualcomm';
      // UNMASKED_RENDERER_WEBGL (37446)
      if (parameter === 37446) return 'Adreno (TM) 730';
      // MAX_TEXTURE_SIZE (3379) - CRITICAL: Was 16384 (desktop), now 8192 (mobile)
      if (parameter === 3379) return 8192;
      // MAX_RENDERBUFFER_SIZE (34024)
      if (parameter === 34024) return 16384;
      // VERSION (7938)
      if (parameter === 7938) return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
      // SHADING_LANGUAGE_VERSION (35724)
      if (parameter === 35724) return 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.00)';
      // VENDOR (7936)
      if (parameter === 7936) return 'WebKit';
      // RENDERER (7937)
      if (parameter === 7937) return 'WebKit WebGL';
      
      return getParam.call(this, parameter);
    };
    
    WebGLRenderingContext.prototype.getParameter = spoofHandler;
    if (getParam2) {
      WebGL2RenderingContext.prototype.getParameter = spoofHandler;
    }
    
    console.log('[Lindo] WebGL spoofed to: Qualcomm Adreno (TM) 730, maxTextureSize: 8192');
  })();

  // 🔥 FIX #5: Override JS Heap Size Limit (was 3.7GB desktop, now 2GB mobile)
  if (window.performance && window.performance.memory) {
    const originalMemory = window.performance.memory;
    Object.defineProperty(window.performance, 'memory', {
      get: () => ({
        get jsHeapSizeLimit() { return 2048000000; }, // 2GB (mobile limit)
        get totalJSHeapSize() { return originalMemory.totalJSHeapSize; },
        get usedJSHeapSize() { return originalMemory.usedJSHeapSize; }
      }),
      configurable: true
    });
  }

  // 🔥 FIX #6: Override screen to conservative mobile values
  Object.defineProperties(screen, {
    width: { 
      get: () => 1080,
      configurable: true,
      enumerable: true
    },
    height: { 
      get: () => 2400,
      configurable: true,
      enumerable: true
    },
    availWidth: { 
      get: () => 1080,
      configurable: true,
      enumerable: true
    },
    availHeight: { 
      get: () => 2400,
      configurable: true,
      enumerable: true
    }
  });

  console.log('[Lindo] Device fingerprint spoofing complete');
  console.log('[Lindo] - RAM:', navigator.deviceMemory, 'GB');
  console.log('[Lindo] - Cores:', navigator.hardwareConcurrency);
  console.log('[Lindo] - Screen:', screen.width, 'x', screen.height);
})();

var events = {
  "mousedown": "touchstart",
  "mouseup": "touchend",
  "mousemove": "touchmove"
};

var mouseDown = false;

var handleEvents = function (e) {
  try {
    if (e.type === "mousedown") mouseDown = true;
    else if (e.type === "mouseup") mouseDown = false;

    if (!mouseDown && e.type === "mousemove") return;

    const touchObj = new Touch({
      identifier: 0,
      target: e.target,
      clientX: e.clientX,
      clientY: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      screenX: e.screenX,
      screenY: e.screenY,
      radiusX: 11.5,
      radiusY: 11.5,
      rotationAngle: 0,
      force: e.type === "mouseup" ? 0 : 1,
    });

    const touchEvent = new TouchEvent(events[e.type], {
      cancelable: true,
      bubbles: true,
      touches: e.type === "mouseup" ? [] : [touchObj],
      targetTouches: e.type === "mouseup" ? [] : [touchObj],
      changedTouches: [touchObj],
      shiftKey: false,
      composed: true,
      isTrusted: true,
      sourceCapabilities: new InputDeviceCapabilities({ firesTouchEvents: true }),
      view: window
    });

    e.target.dispatchEvent(touchEvent);
  } catch (e) {
    top.console.log(e);
  }

  e.stopPropagation();
  return false;
};

try {
  for (var id in events) {
    document.body.addEventListener(id, handleEvents, true);
  }
} catch (e) {
  top.console.log(e);
}

/* Popups - KEEP AS IS */
(function () {
  if (!window.top.lindoVersion) {
    const lastAsked = window.localStorage.getItem('lindo-update-popup');
    if (!lastAsked || Date.now() > parseInt(lastAsked) + 1000 * 60 * 60 * 24 * 7) {
      window.localStorage.setItem('lindo-update-popup', Date.now())
      const texts = {
        fr: { title: `Notification de Lindo`, messages: [`Salut ! Désolé pour l'intrusion.`, `Le site officiel de Lindo a changé d'adresse.`] },
        en: { title: `Notification from Lindo`, messages: [`Hi! Sorry for the intrusion.`, `Lindo official website address has changed.`] },
        es: { title: `Notificación de Lindo`, messages: [`¡Hola! Perdón por la intrusión.`, `La dirección del sitio web oficial de Lindo ha cambiado.`] }
      }
      sendPopup(texts, { url: 'https://lindo-app.com', text: 'lindo-app.com' })
      return
    }
  }

  if (!window.localStorage.getItem('lindo-reddit-popup')) {
    window.localStorage.setItem('lindo-reddit-popup', true)
    const texts = {
      fr: { title: `Notification de Lindo`, messages: [`Le Discord de Lindo a fermé. Tu peux désormais nous retrouver sur Reddit.`] },
      en: { title: `Notification from Lindo`, messages: [`The Discord of Lindo has been shut down. You can now find us on Reddit.`] },
      es: { title: `Notificación de Lindo`, messages: [`El Discord de Lindo ha sido cerrado. Ahora puedes encontrarnos en Reddit.`] }
    }
    sendPopup(texts, { url: 'https://www.reddit.com/r/LindoApp/comments/t7auy1/ouverture_du_subreddit/', text: 'Subreddit de Lindo' })
    return
  }

  const lastAskedMatrix = window.localStorage.getItem('lindo-matrix-popup');
  if (!lastAskedMatrix || Date.now() > parseInt(lastAskedMatrix) + 1000 * 60 * 60 * 24 * 7) {
    window.localStorage.setItem('lindo-matrix-popup', Date.now())
    const texts = {
      fr: { title: `Notification de Lindo`, messages: [`Un nouveau serveur de discussion a été mis en place pour remplacer Discord !`] },
      en: { title: `Notification from Lindo`, messages: [`A new chat server has been set up to replace Discord!`] },
      es: { title: `Notificación de Lindo`, messages: [`¡Se ha configurado un nuevo servidor de chat para reemplazar a Discord!`] }
    }
    sendPopup(texts, { url: 'https://matrix.to/#/#lindo-official:matrix.org', text: 'Matrix Lindo' })
    return
  }
})();
