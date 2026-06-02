import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  archiveObligation,
  createObligation,
  fetchObligation,
  fetchObligations,
  updateObligation
} from 'src/services/api'

export const useObligationsStore = defineStore('obligations', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchObligations()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadOne (id) {
    loading.value = true
    error.value = null
    try {
      return await fetchObligation(id)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function create (input) {
    const item = await createObligation(input)
    await load()
    return item
  }

  async function update (id, input) {
    const item = await updateObligation(id, input)
    await load()
    return item
  }

  async function archive (id) {
    await archiveObligation(id)
    await load()
  }

  return { items, loading, error, load, loadOne, create, update, archive }
})
