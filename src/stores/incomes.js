import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createIncome,
  deleteIncome,
  fetchIncome,
  fetchIncomes,
  updateIncome
} from 'src/services/api'

export const useIncomesStore = defineStore('incomes', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchIncomes()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadOne (id) {
    return fetchIncome(id)
  }

  async function create (input) {
    await createIncome(input)
    await load()
  }

  async function update (id, input) {
    await updateIncome(id, input)
    await load()
  }

  async function remove (id) {
    await deleteIncome(id)
    await load()
  }

  return { items, loading, error, load, loadOne, create, update, remove }
})
