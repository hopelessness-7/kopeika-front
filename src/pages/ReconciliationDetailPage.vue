<template>
  <q-page class="k-page">
    <PageHeader
      title="Выписка"
      :subtitle="item?.original_filename || ''"
      back
      back-to="/reconciliation"
    />

    <div class="k-page-body">
      <PageState :loading="loading && !item" :error="error" :retry="load">
        <div v-if="item" class="k-panel">
          <section class="k-panel__section">
            <p class="k-panel__label">Период</p>
            <p class="detail-value">{{ periodLabel }}</p>
          </section>
          <section class="k-panel__section">
            <p class="k-panel__label">Банк</p>
            <p class="detail-value">{{ bankLabel }}</p>
          </section>
          <section class="k-panel__section">
            <p class="k-panel__label">Загружена</p>
            <p class="detail-value">{{ importedLabel }}</p>
          </section>
          <section v-if="item.transactions_count != null" class="k-panel__section">
            <p class="k-panel__label">Операций в выписке</p>
            <p class="detail-value">{{ item.transactions_count }}</p>
          </section>
          <section v-if="item.summary" class="k-panel__section">
            <p class="k-panel__label">Итог периода</p>
            <div class="k-cols-2">
              <div class="k-metric">
                <div class="k-metric__label">Факт</div>
                <div class="k-metric__value">{{ formatMoney(item.summary.actual_spend) }}</div>
              </div>
              <div class="k-metric">
                <div class="k-metric__label">План</div>
                <div class="k-metric__value">{{ formatMoney(item.summary.planned_spend) }}</div>
              </div>
            </div>
            <p class="detail-delta q-mt-sm">
              Разница: {{ formatMoney(item.summary.delta) }}
            </p>
          </section>
          <section v-if="item.confirmed_balance != null" class="k-panel__section">
            <p class="k-panel__label">Подтверждённый баланс</p>
            <p class="detail-value">{{ formatMoney(item.confirmed_balance) }}</p>
          </section>
          <section class="k-panel__section">
            <q-btn
              outline
              no-caps
              color="primary"
              icon="download"
              label="Скачать CSV"
              class="full-width"
              @click="onDownload"
            />
          </section>
        </div>
      </PageState>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { downloadReconciliationImport } from 'src/services/api'
import { useReconciliationStore } from 'src/stores/reconciliation'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

const route = useRoute()
const store = useReconciliationStore()
const { formatMoney } = useFormatMoney()
const { formatDate } = useFormatDate()

const item = ref(null)
const loading = ref(false)
const error = ref(null)

const bankLabel = computed(() => {
  const m = { sber: 'Сбербанк' }
  return item.value ? (m[item.value.bank] || item.value.bank) : ''
})

const periodLabel = computed(() => {
  if (!item.value) return ''
  const { period_from: from, period_to: to } = item.value
  if (from && to) return `${formatDate(from)} — ${formatDate(to)}`
  return '—'
})

const importedLabel = computed(() => {
  const at = item.value?.imported_at
  return at ? formatDate(at) : '—'
})

onMounted(() => load())

async function load () {
  loading.value = true
  error.value = null
  try {
    item.value = await store.loadImport(route.params.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function onDownload () {
  downloadReconciliationImport(item.value.id)
}
</script>

<style scoped>
.detail-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.detail-delta {
  margin: 0;
  font-size: 0.875rem;
  color: var(--k-text-secondary);
}
</style>
