<template>
  <div class="flex h-screen w-screen items-center justify-center bg-gray-900">
    <div class="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-white">ComfyUI Login</h1>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div class="mt-1">
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-500">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        password: password.value,
      }),
    })

    if (response.ok) {
      // Force reload to update auth state (cookies)
      window.location.href = '/'
    } else {
      error.value = 'Invalid password'
    }
  } catch (e) {
    error.value = 'Login failed. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
