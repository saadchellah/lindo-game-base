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

  // Screen - Viewport dimensions (CSS pixels, not physical)
  Object.defineProperties(screen, {
    width: { get: () => 412, configurable: true, enumerable: true },
    height: { get: () => 915, configurable: true, enumerable: true },
    availWidth: { get: () => 412, configurable: true, enumerable: true },
    availHeight: { get: () => 915, configurable: true, enumerable: true },
    colorDepth: { get: () => 24, configurable: true },
    pixelDepth: { get: () => 24, configurable: true }
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

  // WebGL - GPU hardware
  (function() {
    const getParam = WebGLRenderingContext.prototype.getParameter;
    const getParam2 = WebGL2RenderingContext?.prototype?.getParameter;
    
    const spoofHandler = function(parameter) {
      if (parameter === 37445) return 'Qualcomm';              // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return 'Adreno (TM) 660';       // UNMASKED_RENDERER_WEBGL
      if (parameter === 7938) return 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
      if (parameter === 35724) return 'WebGL GLSL ES 1.0 (OpenGL ES 2.0 Chromium)';
      if (parameter === 7936) return 'WebKit';
      if (parameter === 7937) return 'WebKit WebGL';
      if (parameter === 3379) return 4096;   // MAX_TEXTURE_SIZE
      if (parameter === 34024) return 32768; // MAX_RENDERBUFFER_SIZE
      
      return getParam.call(this, parameter);
    };
    
    WebGLRenderingContext.prototype.getParameter = spoofHandler;
    if (getParam2) {
      WebGL2RenderingContext.prototype.getParameter = spoofHandler;
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
})();

/* ========================================
   LOGGER HARDWARE FIXER
   
   Game sends loggers naturally.
   We intercept and fix ONLY hardware fields.
   ======================================== */
(function() {
  console.log('[Lindo] Installing logger hardware fixer...');

  // Fix hardware fields in logger data
  function fixHardwareFields(data) {
    if (!data.message) return data;
    
    // GPU
    if (data.message.gpu) {
      data.message.gpu.vendor = 'WebKit';
      data.message.gpu.version = 'WebGL 1.0 (OpenGL ES 2.0 Chromium)';
      data.message.gpu.unmaskedvendor = 'Qualcomm';
      data.message.gpu.unmaskedrenderer = 'Adreno (TM) 660';
      data.message.gpu.texturesize = 4096;
      data.message.gpu.rendererbuffersize = 32768;
    }
    
    // Screen
    if (data.message.screen) {
      data.message.screen.width = 412;
      data.message.screen.height = 915;
      data.message.screen.devicepixelratio = 3.5;
    }
    
    // RAM capacity
    if (data.message.ram) {
      data.message.ram.capacity = 6144;  // 6GB in MB
      
      // JS heap limits
      if (data.message.ram.jsheap) {
        data.message.ram.jsheap.jsheapsizelimit = 1136000000;
        data.message.ram.jsheap.totaljsheapsize = Math.min(
          data.message.ram.jsheap.totaljsheapsize, 
          80000000
        );
        data.message.ram.jsheap.usedjsheapsize = Math.min(
          data.message.ram.jsheap.usedjsheapsize, 
          72000000
        );
      }
    }
    
    // Connection type
    if (!data.message.connectiontype) {
      data.message.connectiontype = 'wifi';
    }
    
    return data;
  }

  // Intercept fetch (game uses this for loggers)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('/logger')) {
      const options = args[1] || {};
      
      if (options.body && typeof options.body === 'string') {
        try {
          const data = JSON.parse(options.body);
          const fixed = fixHardwareFields(data);
          options.body = JSON.stringify(fixed);
        } catch (e) {
          console.error('[Lindo] Logger fix failed:', e);
        }
      }
      
      return originalFetch.call(this, url, options);
    }
    
    return originalFetch.apply(this, args);
  };

  console.log('[Lindo] Logger hardware fixer installed');
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
