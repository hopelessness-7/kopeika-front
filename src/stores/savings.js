import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createSaving,
  deleteSaving,
  fetchSaving,
  fetchSavings,
  updateSaving
} from 'src/services/api'

export const useSavingsStore = defineStore('savings', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchSavings()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadOne (id) {
    return fetchSaving(id)
  }

  async function create (input) {
    await createSaving(input)
    await load()
  }

  async function update (id, input) {
    await updateSaving(id, input)
    await load()
  }

  async function remove (id) {
    await deleteSaving(id)
    await load()
  }

  return { items, loading, error, load, loadOne, create, update, remove }
})
