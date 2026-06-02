import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSettings, updateSettings } from 'src/services/api'

export const useSettingsStore = defineStore('settings', () => {
  const data = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchSettings()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function save (input) {
    saving.value = true
    error.value = null
    try {
      data.value = await updateSettings(input)
      return data.value
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      saving.value = false
    }
  }

  return { data, loading, saving, error, load, save }
})
