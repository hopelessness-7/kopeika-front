import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchReconciliationImport,
  fetchReconciliationImports,
  fetchReconciliationSettings,
  updateReconciliationSettings,
  uploadReconciliationImport
} from 'src/services/api'

export const useReconciliationStore = defineStore('reconciliation', () => {
  const imports = ref([])
  const settings = ref(null)
  const loading = ref(false)
  const savingSettings = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      const [list, cfg] = await Promise.all([
        fetchReconciliationImports(),
        fetchReconciliationSettings()
      ])
      imports.value = list
      settings.value = cfg
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadImport (id) {
    return fetchReconciliationImport(id)
  }

  async function saveSettings (input) {
    savingSettings.value = true
    error.value = null
    try {
      settings.value = await updateReconciliationSettings(input)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      savingSettings.value = false
    }
  }

  async function upload (bank, file) {
    const result = await uploadReconciliationImport(bank, file)
    await load()
    return result
  }

  return {
    imports,
    settings,
    loading,
    savingSettings,
    error,
    load,
    loadImport,
    saveSettings,
    upload
  }
})
