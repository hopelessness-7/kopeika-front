import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createGoal,
  deleteGoal,
  fetchGoal,
  fetchGoals,
  updateGoal
} from 'src/services/api'

export const useGoalsStore = defineStore('goals', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load () {
    loading.value = true
    error.value = null
    try {
      items.value = await fetchGoals()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function loadOne (id) {
    return fetchGoal(id)
  }

  async function create (input) {
    const created = await createGoal(input)
    items.value = [created, ...items.value]
    return created
  }

  async function update (id, input) {
    const updated = await updateGoal(id, input)
    const index = items.value.findIndex((g) => g.id === id)
    if (index !== -1) items.value[index] = updated
    return updated
  }

  async function remove (id) {
    await deleteGoal(id)
    items.value = items.value.filter((g) => g.id !== id)
  }

  return { items, loading, error, load, loadOne, create, update, remove }
})
