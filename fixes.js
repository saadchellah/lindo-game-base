/* Touch fix */
var events = {
  mousedown: "touchstart",
  mouseup: "touchend",
  mousemove: "touchmove",
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
      sourceCapabilities: new InputDeviceCapabilities({
        firesTouchEvents: true,
      }),
      view: window,
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
   🔥 HARDWARE FINGERPRINT SPOOFING ONLY
   ======================================== */
(function () {
  console.log("[Lindo] Applying hardware spoofing...");

  // ✅ Navigator hardware properties
  Object.defineProperty(navigator, "deviceMemory", {
    get: () => 6, // 6GB RAM
    configurable: true,
    enumerable: true,
  });

  Object.defineProperty(navigator, "hardwareConcurrency", {
    get: () => 8, // 8 CPU cores
    configurable: true,
    enumerable: true,
  });

  Object.defineProperty(navigator, "platform", {
    get: () => "Linux armv8l", // Android ARM
    configurable: true,
  });

  Object.defineProperty(navigator, "maxTouchPoints", {
    get: () => 5, // Touch screen
    configurable: true,
  });

  // ✅ Connection type (minimal - just wifi)
  if (!navigator.connection) {
    Object.defineProperty(navigator, "connection", {
      get: () => ({
        type: "wifi",
        // Let browser handle: effectiveType, downlink, rtt, saveData
      }),
      configurable: true,
      enumerable: true,
    });
  }

  // ✅ Screen dimensions (VIEWPORT = CSS pixels)
  Object.defineProperties(screen, {
    width: {
      get: () => 412,
      configurable: true,
      enumerable: true,
    },
    height: {
      get: () => 915,
      configurable: true,
      enumerable: true,
    },
    availWidth: {
      get: () => 412,
      configurable: true,
      enumerable: true,
    },
    availHeight: {
      get: () => 915,
      configurable: true,
      enumerable: true,
    },
    colorDepth: {
      get: () => 24,
      configurable: true,
    },
    pixelDepth: {
      get: () => 24,
      configurable: true,
    },
  });

  Object.defineProperty(window, "devicePixelRatio", {
    get: () => 3.5,
    configurable: true,
  });

  Object.defineProperty(window, "innerWidth", {
    get: () => 412,
    configurable: true,
  });

  Object.defineProperty(window, "innerHeight", {
    get: () => 915,
    configurable: true,
  });

  // ✅ WebGL hardware
  (function () {
    const getParam = WebGLRenderingContext.prototype.getParameter;
    const getParam2 = WebGL2RenderingContext?.prototype?.getParameter;

    const spoofHandler = function (parameter) {
      // GPU vendor/renderer
      if (parameter === 37445) return "Qualcomm";
      if (parameter === 37446) return "Adreno (TM) 660";

      // WebGL version strings
      if (parameter === 7938) return "WebGL 1.0 (OpenGL ES 2.0 Chromium)";
      if (parameter === 35724)
        return "WebGL GLSL ES 1.0 (OpenGL ES 2.0 Chromium)";
      if (parameter === 7936) return "WebKit";
      if (parameter === 7937) return "WebKit WebGL";

      // Texture/buffer limits (mobile)
      if (parameter === 3379) return 4096; // MAX_TEXTURE_SIZE
      if (parameter === 34024) return 32768; // MAX_RENDERBUFFER_SIZE

      return getParam.call(this, parameter);
    };

    WebGLRenderingContext.prototype.getParameter = spoofHandler;
    if (getParam2) {
      WebGL2RenderingContext.prototype.getParameter = spoofHandler;
    }
  })();

  // ✅ JS Heap (mobile limit ~1GB)
  if (window.performance?.memory) {
    const orig = window.performance.memory;
    Object.defineProperty(window.performance, "memory", {
      get: () => ({
        get jsHeapSizeLimit() {
          return 1136000000;
        }, // 1.13GB
        get totalJSHeapSize() {
          return Math.min(orig.totalJSHeapSize, 80000000);
        },
        get usedJSHeapSize() {
          return Math.min(orig.usedJSHeapSize, 72000000);
        },
      }),
      configurable: true,
    });
  }

  console.log("[Lindo] Hardware spoofing complete");
  console.log("[Lindo] - Screen: 412x915 @ DPR 3.5");
  console.log("[Lindo] - RAM: 6GB, Cores: 8");
  console.log("[Lindo] - GPU: Qualcomm Adreno 660");
})();

/* ========================================
   🔍 LOGGER DETECTOR (Debugging Only)
   ======================================== */
(function () {
  console.log("[Lindo] Installing logger detector...");

  // Detect fetch usage
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];

    if (typeof url === "string" && url.includes("/logger")) {
      console.log("[Lindo] ✅ Game uses FETCH for loggers");
      console.log("[Lindo] URL:", url);

      const options = args[1] || {};
      if (options.body) {
        console.log(
          "[Lindo] Logger payload (fetch):",
          options.body.substring(0, 200) + "..."
        );
      }
    }

    return originalFetch.apply(this, args);
  };

  // Detect XHR usage
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._url = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._url && this._url.includes("/logger")) {
      console.log("[Lindo] ✅ Game uses XHR for loggers");
      console.log("[Lindo] URL:", this._url);

      if (body) {
        console.log(
          "[Lindo] Logger payload (XHR):",
          body.substring(0, 200) + "..."
        );
      }
    }

    return originalSend.call(this, body);
  };

  console.log(
    "[Lindo] Logger detector installed (check console for detection)"
  );
})();

/* ========================================
   🔥 LOGGER DATA FIXER (Hardware Only)
   ======================================== */
(function () {
  console.log("[Lindo] Installing logger hardware fixer...");

  // Helper to fix ONLY hardware fields
  function fixHardwareFields(data) {
    if (!data.message) return data;

    let fixed = false;

    // ✅ Fix GPU (hardware only)
    if (data.message.gpu) {
      data.message.gpu.vendor = "WebKit";
      data.message.gpu.version = "WebGL 1.0 (OpenGL ES 2.0 Chromium)";
      data.message.gpu.unmaskedvendor = "Qualcomm";
      data.message.gpu.unmaskedrenderer = "Adreno (TM) 660";
      data.message.gpu.texturesize = 4096;
      data.message.gpu.rendererbuffersize = 32768;
      fixed = true;
    }

    // ✅ Fix screen (hardware only)
    if (data.message.screen) {
      data.message.screen.width = 412;
      data.message.screen.height = 915;
      data.message.screen.devicepixelratio = 3.5;
      fixed = true;
    }

    // ✅ Fix RAM capacity (hardware only)
    if (data.message.ram) {
      data.message.ram.capacity = 6144; // 6GB in MB

      // Fix JS heap limits
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

      fixed = true;
    }

    // ✅ Add connection type if missing
    if (!data.message.connectiontype) {
      data.message.connectiontype = "wifi";
      fixed = true;
    }

    // ❌ DON'T touch game state:
    // - versions (let game report correct version)
    // - sounds (let game report actual buffers)
    // - indexeddbsize (let game report actual usage)
    // - roleplayfps (let game report actual FPS)
    // - fightfps (let game report actual FPS)
    // - maploadinglatency (let game report actual latency)
    // - mapchangelatency (let game report actual latency)
    // - ram.game (let game report actual usage)
    // - ram.audio (let game report actual usage)

    if (fixed) {
      console.log("[Lindo] Fixed hardware fields in logger");
    }

    return data;
  }

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];

    if (typeof url === "string" && url.includes("/logger")) {
      const options = args[1] || {};

      if (options.body && typeof options.body === "string") {
        try {
          const data = JSON.parse(options.body);
          const fixed = fixHardwareFields(data);
          options.body = JSON.stringify(fixed);
        } catch (e) {
          console.error("[Lindo] Fetch fix failed:", e);
        }
      }

      return originalFetch.call(this, url, options);
    }

    return originalFetch.apply(this, args);
  };

  // Intercept XHR
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._url = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._url && this._url.includes("/logger") && body) {
      try {
        const data = JSON.parse(body);
        const fixed = fixHardwareFields(data);
        body = JSON.stringify(fixed);
      } catch (e) {
        console.error("[Lindo] XHR fix failed:", e);
      }
    }
    return originalSend.call(this, body);
  };

  console.log("[Lindo] Logger hardware fixer installed");
})();

/* ========================================
   🎯 LOGIN LOGGERS (Minimal Game State)
   ======================================== */
(function () {
  let loginLoggerCount = 0;

  function sendLoginLogger() {
    if (loginLoggerCount >= 2) return;

    const uuid = localStorage.getItem("lindo_device_uuid") || "unknown";

    // ✅ Minimal payload - only hardware info, no game state
    const payload = {
      channelName: "error",
      message:
        "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit. 11",
      data: {
        clientInfo: JSON.stringify({
          userAgent: navigator.userAgent,
          clientConfig: {
            assetsUrl: window.Config?.assetsUrl || "",
            language: window.Config?.language || "en",
            sessionId: window.Config?.sessionId || "",
          },
          isFetchPolyfill: true,
          identifier: "13.0.0||SM-G998U|Android|15|" + uuid + "|unknown",
          // ❌ Removed fake game state:
          // - characterInfo (let game populate)
        }),
        accountId: 0,
      },
    };

    fetch("https://dt-proxy-production-login.ankama-games.com/logger", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "com.ankama.dofustouch",
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        loginLoggerCount++;
        console.log("[Lindo] Login logger sent (" + loginLoggerCount + "/2)");
      })
      .catch((e) => {
        console.error("[Lindo] Login logger failed:", e);
      });
  }

  // Wait for Primus to exist, then hook it
  function installPrimusHook() {
    if (!window.Primus) {
      setTimeout(installPrimusHook, 100);
      return;
    }

    console.log("[Lindo] Installing Primus hook...");

    const OriginalPrimus = window.Primus;

    window.Primus = function (url, options) {
      const instance = new OriginalPrimus(url, options);

      if (url.includes("dt-proxy-production-login")) {
        console.log("[Lindo] Login server Primus detected");

        instance.on("open", () => {
          console.log("[Lindo] Login server connected");
          setTimeout(sendLoginLogger, 1000);
        });

        instance.on("end", () => {
          console.log("[Lindo] Login server disconnecting");
          sendLoginLogger();
        });
      }

      return instance;
    };

    window.Primus.prototype = OriginalPrimus.prototype;
    Object.setPrototypeOf(window.Primus, OriginalPrimus);

    console.log("[Lindo] Primus hook installed");
  }

  installPrimusHook();
})();

/* ========================================
   📢 POPUPS (Lindo Notifications)
   ======================================== */
(function () {
  async function sendPopup(texts, link) {
    const wait1 = new Promise((r) => {
      const i = setInterval(() => {
        if (window.Config?.language) {
          clearInterval(i);
          r();
        }
      }, 1000);
    });

    const wait2 = new Promise((r) => {
      const img = new Image();
      img.onload = r;
      img.src = "https://lindo-app.com/icon.png";
    });

    await Promise.all([wait1, wait2]);

    const t =
      texts[window.Config.language] ||
      texts["en"] ||
      texts[Object.keys(texts)[0]];

    window.gui.openSimplePopup(
      `
      <div>
        ${t.messages.join("<br />")}<br />
        <a target="_blank" href="${
          link.url
        }" style="text-align: center; font-size: 1.2em; display: inline-block; width: 100%; margin-top: 0.4em; text-decoration: none;">
          <img src="https://lindo-app.com/icon.png" style="height: 1.2em; display: inline-block; vertical-align: middle;"/>
          <span style="vertical-align: middle;">${link.text}</span>
        </a>
      </div>
    `,
      t.title
    );
  }

  if (!window.top.lindoVersion) {
    const last = localStorage.getItem("lindo-update-popup");
    if (!last || Date.now() > parseInt(last) + 604800000) {
      localStorage.setItem("lindo-update-popup", Date.now());
      sendPopup(
        {
          fr: { title: "Lindo", messages: ["Le site a changé !"] },
          en: { title: "Lindo", messages: ["Website changed!"] },
          es: { title: "Lindo", messages: ["¡Sitio cambiado!"] },
        },
        { url: "https://lindo-app.com", text: "lindo-app.com" }
      );
    }
  }
})();
