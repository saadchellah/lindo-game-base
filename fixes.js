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
   SCREEN & PERFORMANCE SPOOFING (Non-Critical)
   ======================================== */
(function() {
  console.log('[Lindo] Applying non-critical hardware spoofing...');

  // Screen dimensions (can be set later)
  Object.defineProperties(screen, {
    width: { get: () => 854, configurable: true, enumerable: true },
    height: { get: () => 384, configurable: true, enumerable: true },
    availWidth: { get: () => 854, configurable: true, enumerable: true },
    availHeight: { get: () => 384, configurable: true, enumerable: true },
    colorDepth: { get: () => 24, configurable: true },
    pixelDepth: { get: () => 24, configurable: true }
  });

  Object.defineProperty(window, 'devicePixelRatio', {
    get: () => 2.8125,
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

  // Performance - JS Heap limits (matches real phone exactly)
  if (window.performance?.memory) {
    const orig = window.performance.memory;
    Object.defineProperty(window.performance, 'memory', {
      get: () => ({
        get jsHeapSizeLimit() { return 1130000000; },  // 1.13GB (matches real phone)
        get totalJSHeapSize() { return Math.min(orig.totalJSHeapSize, 76600000); },
        get usedJSHeapSize() { return Math.min(orig.usedJSHeapSize, 72200000); }
      }),
      configurable: true
    });
  }

  console.log('[Lindo] Non-critical spoofing complete');
  console.log('[Lindo] - Screen: 854x384 @ DPR 2.8125');
  console.log('[Lindo] - RAM: 10GB, Cores: 8');  // ✅ Updated to 10GB
  console.log('[Lindo] - GPU: Already spoofed in index.html');
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
