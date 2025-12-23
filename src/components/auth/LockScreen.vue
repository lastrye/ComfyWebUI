<template>
  <div v-if="isLocked" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
    <!-- Background Animation -->
    <div class="absolute inset-0 z-0">
      <iframe 
        src="/usersocket/animations/flowlight.html" 
        class="h-full w-full border-0"
        style="pointer-events: none;"
        title="Background Animation"
      ></iframe>
      <!-- Overlay for better text contrast -->
      <div class="absolute inset-0 bg-gray-900/60"></div>
    </div>

    <div class="relative z-10 w-full max-w-md rounded-2xl bg-gray-800/90 p-8 shadow-2xl border border-gray-700 backdrop-blur-md">
      <div class="flex flex-col items-center">
        <div class="mb-6 rounded-full bg-gray-700 p-4">
          <i class="pi pi-lock text-4xl text-emerald-500"></i>
        </div>
        <h2 class="mb-2 text-2xl font-bold text-white">
          {{ savedUsername ? `Locked as ${savedUsername}` : 'Screen Locked' }}
        </h2>
        <p class="mb-8 text-gray-400">Enter your password to resume</p>
        
        <form @submit.prevent="handleUnlock" class="w-full">
          <div v-if="!savedUsername" class="mb-4">
             <div class="relative">
                <i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  v-model="usernameInput" 
                  type="text" 
                  placeholder="Username" 
                  class="w-full rounded-lg border border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
             </div>
          </div>

          <div class="mb-6">
             <div class="relative">
                <i class="pi pi-key absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input 
                  v-model="password" 
                  type="password" 
                  placeholder="Password" 
                  class="w-full rounded-lg border border-gray-600 bg-gray-700 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autofocus
                />
             </div>
             <p v-if="errorMsg" class="mt-2 text-sm text-red-400">{{ errorMsg }}</p>
          </div>
          
          <button 
            type="submit" 
            class="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Unlocking...' : 'Unlock' }}
          </button>
        </form>
        
        <div class="mt-6 text-center flex flex-col gap-2">
            <button v-if="savedUsername" @click="clearSavedUser" class="text-sm text-gray-400 hover:text-white">
                Not {{ savedUsername }}?
            </button>
            <button @click="handleLogout" class="text-sm text-gray-400 hover:text-white underline">
                Log out completely
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useLockScreen } from '@/composables/useLockScreen'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

// Import assets
// Assets removed as we use flowlight.html iframe

const { isLocked, unlock } = useLockScreen()
const { handleSignOut } = useCurrentUser()

onMounted(() => {
  console.log('LockScreen mounted')
})

const password = ref('')
const usernameInput = ref('')
const savedUsername = ref('')
const loading = ref(false)
const errorMsg = ref('')

const loadSavedUser = () => {
    const u = localStorage.getItem('comfy_username')
    if (u) {
        savedUsername.value = u
        usernameInput.value = u
    }
}

// Watch for lock state to refresh username
watch(isLocked, (val) => {
    if (val) {
        loadSavedUser()
        password.value = ''
        errorMsg.value = ''
    }
})

onMounted(() => {
    loadSavedUser()
})

const clearSavedUser = () => {
    savedUsername.value = ''
    usernameInput.value = ''
    localStorage.removeItem('comfy_username')
}

const handleUnlock = async () => {
  if (!password.value || !usernameInput.value) {
      errorMsg.value = 'Please fill in all fields'
      return
  }
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: usernameInput.value,
            password: password.value
        })
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
        // Save username if not already
        if (!savedUsername.value) {
            localStorage.setItem('comfy_username', usernameInput.value)
        }
        unlock();
        password.value = '';
    } else {
        errorMsg.value = data.message || 'Incorrect password';
    }
  } catch (e) {
    errorMsg.value = 'Network error';
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
    unlock() // Unlock first to allow redirection
    await handleSignOut()
}
</script>
