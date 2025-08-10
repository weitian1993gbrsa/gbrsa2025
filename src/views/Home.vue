<template>
  <main class="container mx-auto px-2">
    <div class="mx-auto max-w-44 mt-8">
      <img src="../assets/logo.svg" alt="RopeScore" class="w-full" />
    </div>
    <h1 class="text-center text-4xl font-bold mt-6">RopeScore Judging</h1>

    <nav class="grid grid-cols-1 gap-8 mt-8">
      <router-link
        class="block p-2 text-center text-lg text-white bg-green-500 hover:bg-green-600 rounded"
        to="/practice"
      >
        Practice
      </router-link>
    </nav>
  </main>
</template>

<script lang="ts" setup>
// Home page stripped to only Practice.
</script>
