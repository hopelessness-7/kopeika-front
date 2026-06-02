import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDashboard, updateBalance } from 'src/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchDashboard()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function setBalance (amount) {
    const result = await updateBalance(amount)
    if (data.value) {
      data.value.balance = result.balance
      data.value.balance_updated_at = result.balance_updated_at
    }
    return result
  }

  function setFromResponse (response) {
    data.value = response
  }

  return { data, loading, error, load, setBalance, setFromResponse }
})
