/* ========================================
   LINDO FIXES - Post-Game-Load Patches
   
   NOTE: All hardware spoofing now happens in index.html
   This file only contains fixes that need the DOM/game ready
   ======================================== */

console.log('[Lindo] Loading post-game fixes...');

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
  console.log('[Lindo] Touch event conversion enabled');
} catch (e) {
  top.console.log('[Lindo] Touch conversion failed:', e);
}

console.log('[Lindo] Post-game fixes complete');
console.log('[Lindo] (Hardware spoofing was applied in index.html)');
