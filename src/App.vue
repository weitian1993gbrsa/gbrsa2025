<template>
  <div class="page">
    <header class="topbar">
      <img src="./assets/company-logo.png" alt="GBRSA" class="logo" />
      <div class="titles">
        <h1>GBRSA Score</h1>
        <p class="subtitle">Official Scoring Portal</p>
      </div>
    </header>

    <main class="hero">
      <section class="hero-content">
        <h2 class="hero-title">Scan. Score. Sync.</h2>
        <p class="hero-text">Paperless judging for Speed and Freestyle.</p>
        <div class="menu-grid">
          <!-- Add links or router-view here -->
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

function disableZoomGestures() {
  document.addEventListener('touchstart', e => {
    if (e.touches && e.touches.length > 1) e.preventDefault()
  }, { passive: false })

  let lastTouchEnd = 0
  document.addEventListener('touchend', e => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) e.preventDefault()
    lastTouchEnd = now
  }, { passive: false })

  document.addEventListener('gesturestart', e => e.preventDefault())
}

onMounted(() => {
  disableZoomGestures()
})
</script>

<style>
html, body {
  touch-action: manipulation;
  overscroll-behavior: contain;
}
</style>
