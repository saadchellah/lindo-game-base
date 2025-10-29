/* Touch fix */
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

/* 🔥 DEVICE SPOOFING (runs after script.js loads) */
(function() {
  console.log('[Lindo] Applying device spoofing...');

  // 🔥 Navigator properties
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 6,  // 6GB RAM
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8,  // 8 cores
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(navigator, 'platform', {
    get: () => 'Linux armv8l',
    configurable: true
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    get: () => 5,
    configurable: true
  });

  // 🔥 Connection API (CRITICAL - was missing)
  if (!navigator.connection) {
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
        type: 'wifi'
      }),
      configurable: true,
      enumerable: true
    });
  }

  // 🔥 Screen (VIEWPORT size, not physical!)
  // Physical: 1440x3200, Viewport: 412x915 (1440/3.5, 3200/3.5)
  Object.defineProperties(screen, {
    width: { 
      get: () => 412,  // ✅ VIEWPORT CSS pixels
      configurable: true,
      enumerable: true
    },
    height: { 
      get: () => 915,  // ✅ VIEWPORT CSS pixels
      configurable: true,
      enumerable: true
    },
    availWidth: { 
      get: () => 412,
      configurable: true,
      enumerable: true
    },
    availHeight: { 
      get: () => 915,
      configurable: true,
      enumerable: true
    },
    colorDepth: {
      get: () => 24,
      configurable: true
    },
    pixelDepth: {
      get: () => 24,
      configurable: true
    }
  });

  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => 3.5,
    configurable: true
  });

  Object.defineProperty(window, 'innerWidth', {
    get: () => 412,
    configurable: true
  });

  Object.defineProperty(window, 'innerHeight', {
    get: () => 915,
    configurable: true
  });

  // 🔥 WebGL Spoofing
  (function() {
    const getParam = WebGLRenderingContext.prototype.getParameter;
    const getParam2 = WebGL2RenderingContext?.prototype?.getParameter;
    
    const spoofHandler = function(parameter) {
      if (parameter === 37445) return 'Qualcomm';  // UNMASKED_VENDOR
      if (parameter === 37446) return 'Adreno (TM) 660';  // UNMASKED_RENDERER (660 not 730!)
      if (parameter === 7938) return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';  // VERSION
      if (parameter === 35724) return 'WebGL GLSL ES 1.0 (OpenGL ES 2.0 Chromium)';  // SHADING
      if (parameter === 7936) return 'WebKit';  // VENDOR
      if (parameter === 7937) return 'WebKit WebGL';  // RENDERER
      if (parameter === 3379) return 4096;  // MAX_TEXTURE_SIZE (mobile)
      if (parameter === 34024) return 32768;  // MAX_RENDERBUFFER_SIZE
      
      return getParam.call(this, parameter);
    };
    
    WebGLRenderingContext.prototype.getParameter = spoofHandler;
    if (getParam2) {
      WebGL2RenderingContext.prototype.getParameter = spoofHandler;
    }
  })();

  // 🔥 JS Heap (mobile: ~1GB)
  if (window.performance?.memory) {
    const orig = window.performance.memory;
    Object.defineProperty(window.performance, 'memory', {
      get: () => ({
        get jsHeapSizeLimit() { return 1136000000; },  // 1.13GB
        get totalJSHeapSize() { return Math.min(orig.totalJSHeapSize, 80000000); },
        get usedJSHeapSize() { return Math.min(orig.usedJSHeapSize, 72000000); }
      }),
      configurable: true
    });
  }

  // 🔥 Fetch interceptor (fixes logger data)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('/logger')) {
      const options = args[1] || {};
      
      if (options.body && typeof options.body === 'string') {
        try {
          const data = JSON.parse(options.body);
          
          if (data.message) {
            // Fix GPU
            if (data.message.gpu) {
              data.message.gpu.vendor = 'WebKit';
              data.message.gpu.version = 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
              data.message.gpu.unmaskedvendor = 'Qualcomm';
              data.message.gpu.unmaskedrenderer = 'Adreno (TM) 660';
              data.message.gpu.texturesize = 4096;
              data.message.gpu.rendererbuffersize = 32768;
            }
            
            // Fix screen
            if (data.message.screen) {
              data.message.screen.width = 412;
              data.message.screen.height = 915;
              data.message.screen.devicepixelratio = 3.5;
            }
            
            // Fix RAM
            if (data.message.ram) {
              data.message.ram.capacity = 6144;  // 6GB in MB
              
              if (data.message.ram.jsheap) {
                data.message.ram.jsheap.jsheapsizelimit = 1136000000;
                data.message.ram.jsheap.totaljsheapsize = Math.min(data.message.ram.jsheap.totaljsheapsize, 80000000);
                data.message.ram.jsheap.usedjsheapsize = Math.min(data.message.ram.jsheap.usedjsheapsize, 72000000);
              }
              
              if (data.message.ram.game) {
                data.message.ram.game.percentage = Math.min(data.message.ram.game.percentage, 200);
              }
              
              if (data.message.ram.audio) {
                data.message.ram.audio.totalusedmemory = Math.random() * 10 + 50;
                data.message.ram.audio.maxusedmemory = Math.min(data.message.ram.audio.maxusedmemory, 400);
              }
            }
            
            // Fix sounds
            if (data.message.sounds) {
              data.message.sounds.connectbuf = Math.floor(Math.random() * 50) + 120;
              data.message.sounds.disconnectbuf = data.message.sounds.connectbuf - 1;
            }
            
            // Fix IndexedDB
            if (data.message.indexeddbsize) {
              data.message.indexeddbsize.quota = 80000000000 + Math.random() * 5000000000;
            }
            
            // Fix FPS
            if (data.message.roleplayfps?.session) {
              const fps = data.message.roleplayfps.session;
              fps.min = Math.max(fps.min, 14);
              if (fps.average > fps.max - 5) {
                fps.min = fps.max - 15;
              }
            }
            
            if (data.message.fightfps) {
              data.message.fightfps.session = {min: 0, max: 0, average: 0};
              data.message.fightfps.lastsecondsaverage = {min: 0, max: 0, average: 0};
            }
            
            // Fix latency
            if (data.message.maploadinglatency) {
              data.message.maploadinglatency = {min: 0, max: 0, average: 0};
            }
            if (data.message.mapchangelatency) {
              data.message.mapchangelatency = {min: 0, max: 0, average: 0};
            }
            
            // Fix version
            if (data.message.versions !== undefined) {
              data.message.versions = 357;
            }
            
            // Add connection type
            if (!data.message.connectiontype) {
              data.message.connectiontype = 'wifi';
            }
            
            // Remove worldmap
            delete data.message.worldmap;
          }
          
          options.body = JSON.stringify(data);
        } catch (e) {
          console.error('[Lindo] Logger fix failed:', e);
        }
      }
      
      return originalFetch.call(this, url, options);
    }
    
    return originalFetch.apply(this, args);
  };

  // 🔥 Primus hook (2 login loggers)
  const OriginalPrimus = window.Primus;
  let loginLoggerCount = 0;
  
  function sendLoginLogger() {
    if (loginLoggerCount >= 2) return;
    
    const uuid = localStorage.getItem('lindo_device_uuid') || 'unknown';
    const payload = {
      channelName: "error",
      message: "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit. 11",
      data: {
        clientInfo: JSON.stringify({
          userAgent: navigator.userAgent,
          clientConfig: {
            assetsUrl: window.Config?.assetsUrl || "",
            language: window.Config?.language || "en",
            sessionId: window.Config?.sessionId || ""
          },
          isFetchPolyfill: true,
          identifier: '13.0.0||SM-G998U|Android|15|' + uuid + '|unknown',
          characterInfo: {
            groupFlags: "",
            nickname: "",
            isGuiConnected: false,
            mapId: 0,
            openWindows: [],
            lastClosedWindow: "cleanAssets",
            fightState: -1,
            appVersion: "3.9.0",
            buildVersion: "1.70.7",
            appStart: Date.now(),
            lastDisconnect: -1,
            lastCharaSelection: -1,
            lastReceivedMessage: "ServersListMessage"
          }
        }),
        accountId: 0
      }
    };
    
    fetch("https://dt-proxy-production-login.ankama-games.com/logger", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "com.ankama.dofustouch"
      },
      body: JSON.stringify(payload)
    }).then(() => {
      loginLoggerCount++;
      console.log('[Lindo] Login logger sent (count: ' + loginLoggerCount + ')');
    }).catch(e => {
      console.error('[Lindo] Failed to send login logger:', e);
    });
  }
  
  window.Primus = function(url, options) {
    const instance = new OriginalPrimus(url, options);
    const isLoginServer = url.includes('dt-proxy-production-login');
    
    if (isLoginServer) {
      instance.on('open', function() {
        setTimeout(sendLoginLogger, 1000);
      });
      
      instance.on('end', function() {
        sendLoginLogger();
      });
    }
    
    return instance;
  };
  
  window.Primus.prototype = OriginalPrimus.prototype;
  Object.setPrototypeOf(window.Primus, OriginalPrimus);

  console.log('[Lindo] Device spoofing complete');
  console.log('[Lindo] - Viewport:', screen.width, 'x', screen.height, '@ DPR', window.devicePixelRatio);
  console.log('[Lindo] - RAM:', navigator.deviceMemory, 'GB');
  console.log('[Lindo] - GPU: Qualcomm Adreno (TM) 660');
})();

/* Popups */
(function () {
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

    await Promise.all([languagesInitialized, lindoLogoLoaded]);

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
  }

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
