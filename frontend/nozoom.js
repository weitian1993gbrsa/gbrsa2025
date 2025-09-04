// Disable pinch-zoom & double-tap zoom (mobile)
(function () {
  document.addEventListener('touchstart', function (e) {
    if (e.touches && e.touches.length > 1) { e.preventDefault(); }
  }, { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) { e.preventDefault(); }
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
})();