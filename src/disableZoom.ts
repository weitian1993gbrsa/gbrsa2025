export function disableZoom() {
  const block = (e: Event) => e.preventDefault();
  // iOS Safari pinch gestures
  document.addEventListener('gesturestart', block);
  document.addEventListener('gesturechange', block);
  document.addEventListener('gestureend', block);
  // Ctrl/Cmd + wheel zoom (desktop)
  document.addEventListener('wheel', (e: WheelEvent) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  // Reduce double-tap zoom
  (document.documentElement as HTMLElement).style.touchAction = 'manipulation';
}
