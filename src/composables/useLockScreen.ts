import { ref } from 'vue'

const isLocked = ref(false)

export const useLockScreen = () => {
  const lock = () => {
    isLocked.value = true
  }

  const unlock = () => {
    isLocked.value = false
  }

  return {
    isLocked,
    lock,
    unlock
  }
}
