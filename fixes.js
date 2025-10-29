/* ========================================
   TOUCH EVENT CONVERSION
   ======================================== */
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

/* ========================================
   HARDWARE FINGERPRINT SPOOFING
   ======================================== */
(function() {
  console.log('[Lindo] Applying hardware spoofing...');

  // Navigator - Hardware specs
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => 6,  // 6GB RAM
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => 8,  // 8 CPU cores
    configurable: true,
    enumerable: true
  });

  Object.defineProperty(navigator, 'platform', {
    get: () => 'Linux armv8l',  // Android ARM64
    configurable: true
  });

  Object.defineProperty(navigator, 'maxTouchPoints', {
    get: () => 5,  // Touch screen
    configurable: true
  });

  // Connection - Minimal (just type)
  if (!navigator.connection) {
    Object.defineProperty(navigator, 'connection', {
      get: () => ({ type: 'wifi' }),
      configurable: true,
      enumerable: true
    });
  }

  // Screen - Viewport dimensions (LANDSCAPE orientation)
  Object.defineProperties(screen, {
    width: { get: () => 854, configurable: true, enumerable: true },    // Landscape width
    height: { get: () => 384, configurable: true, enumerable: true },   // Landscape height
    availWidth: { get: () => 854, configurable: true, enumerable: true },
    availHeight: { get: () => 384, configurable: true, enumerable: true },
    colorDepth: { get: () => 24, configurable: true },
    pixelDepth: { get: () => 24, configurable: true }
  });

  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => 2.8125,  // Match real device
    configurable: true
  });

  Object.defineProperty(window, 'innerWidth', {
    get: () => 854,
    configurable: true
  });

  Object.defineProperty(window, 'innerHeight', {
    get: () => 384,
    configurable: true
  });

  // WebGL - GPU hardware (already spoofed in index.html before game loads)
  // Verify it's working
  (function() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const vendor = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL);
      console.log('[Lindo] GPU verification:', vendor, '-', renderer);
    }
  })();

  // Performance - JS Heap limits (mobile: ~1GB)
  if (window.performance?.memory) {
    const orig = window.performance.memory;
    Object.defineProperty(window.performance, 'memory', {
      get: () => ({
        get jsHeapSizeLimit() { return 1136000000; },
        get totalJSHeapSize() { return Math.min(orig.totalJSHeapSize, 80000000); },
        get usedJSHeapSize() { return Math.min(orig.usedJSHeapSize, 72000000); }
      }),
      configurable: true
    });
  }

  console.log('[Lindo] Hardware spoofing complete');
  console.log('[Lindo] - Screen: 854x384 @ DPR 2.8125 (landscape)');
  console.log('[Lindo] - RAM: 6GB, Cores: 8');
  console.log('[Lindo] - GPU: Verified above');
  console.log('[Lindo] Note: Game reads these spoofed values directly');
})();

/* ========================================
   LOGGER MINIMAL FIXER
   
   Only fixes fields that CAN'T be spoofed via browser APIs:
   - ram.capacity (API only returns integer GB)
   - connectiontype (may be missing)
   ======================================== */
(function() {
  console.log('[Lindo] Installing minimal logger fixer...');

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('/logger')) {
      const options = args[1] || {};
      
      if (options.body && typeof options.body === 'string') {
        try {
          const data = JSON.parse(options.body);
          
          if (data.message) {
            // Fix RAM capacity (can't spoof via API - only supports integer GB)
            if (data.message.ram && !data.message.ram.capacity) {
              data.message.ram.capacity = 10812915712;  // ~10.8GB in bytes
            }
            
            // Add connection type if missing
            if (!data.message.connectiontype) {
              data.message.connectiontype = 'wifi';
            }
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

  console.log('[Lindo] Minimal logger fixer installed (RAM + connectiontype only)');
})();

/* ========================================
   LINDO POPUPS (Optional Notifications)
   ======================================== */
(function () {
  async function sendPopup(texts, link) {
    const waitConfig = new Promise(r => {
      const i = setInterval(() => {
        if (window.Config?.language) {
          clearInterval(i);
          r();
        }
      }, 1000);
    });
    
    const waitLogo = new Promise(r => {
      const img = new Image();
      img.onload = r;
      img.src = "https://lindo-app.com/icon.png";
    });

    await Promise.all([waitConfig, waitLogo]);

    const t = texts[window.Config.language] || texts['en'] || texts[Object.keys(texts)[0]];

    window.gui.openSimplePopup(`
      <div>
        ${t.messages.join('<br />')}<br />
        <a target="_blank" href="${link.url}" style="text-align: center; font-size: 1.2em; display: inline-block; width: 100%; margin-top: 0.4em; text-decoration: none;">
          <img src="https://lindo-app.com/icon.png" style="height: 1.2em; display: inline-block; vertical-align: middle;"/>
          <span style="vertical-align: middle;">${link.text}</span>
        </a>
      </div>
    `, t.title);
  }

  // Website change notification (once per week)
  if (!window.top.lindoVersion) {
    const last = localStorage.getItem('lindo-update-popup');
    if (!last || Date.now() > parseInt(last) + 604800000) {
      localStorage.setItem('lindo-update-popup', Date.now())
      sendPopup({
        fr: { title: 'Lindo', messages: ['Le site a changé !'] },
        en: { title: 'Lindo', messages: ['Website changed!'] },
        es: { title: 'Lindo', messages: ['¡Sitio cambiado!'] }
      }, { url: 'https://lindo-app.com', text: 'lindo-app.com' })
    }
  }
})();
