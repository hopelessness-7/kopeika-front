import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  archiveObligation,
  closeObligation,
  createObligation,
  createObligationPayment,
  deleteObligationPayment,
  fetchObligation,
  fetchObligationPayments,
  fetchObligations,
  reopenObligation,
  updateObligation
} from 'src/services/api'

export const useObligationsStore = defineStore('obligations', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const detail = ref(null)
  const payments = ref([])
  const detailLoading = ref(false)
  const detailError = ref(null)

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

  async function loadDetail (id) {
    detailLoading.value = true
    detailError.value = null
    try {
      const [obligation, history] = await Promise.all([
        fetchObligation(id, { withSummary: true }),
        fetchObligationPayments(id)
      ])
      detail.value = obligation
      payments.value = history
      return obligation
    } catch (e) {
      detailError.value = e.message
      throw e
    } finally {
      detailLoading.value = false
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

  async function addPayment (id, input) {
    const payment = await createObligationPayment(id, input)
    await loadDetail(id)
    return payment
  }

  async function removePayment (obligationId, paymentId) {
    await deleteObligationPayment(obligationId, paymentId)
    await loadDetail(obligationId)
  }

  async function close (id) {
    const item = await closeObligation(id)
    await loadDetail(id)
    return item
  }

  async function reopen (id) {
    const item = await reopenObligation(id)
    await loadDetail(id)
    return item
  }

  return {
    items,
    loading,
    error,
    detail,
    payments,
    detailLoading,
    detailError,
    load,
    loadOne,
    loadDetail,
    create,
    update,
    archive,
    addPayment,
    removePayment,
    close,
    reopen
  }
})
