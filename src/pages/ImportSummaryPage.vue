<template>
  <q-page class="k-page">
    <PageHeader title="Итог периода" :subtitle="summarySubtitle" back back-to="/import" />

    <div class="k-page-body">
      <PageState :loading="loading" :error="error" :retry="load">
        <template v-if="summary">
          <div class="k-stack">
            <div class="k-panel">
              <q-list>
                <q-item>
                  <q-item-section class="text-grey-7">Потратили</q-item-section>
                  <q-item-section side class="text-weight-bold">
                    {{ formatMoney(summary.actual_spend) }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section class="text-grey-7">По плану</q-item-section>
                  <q-item-section side class="text-weight-bold">
                    {{ formatMoney(summary.planned_spend) }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section class="text-grey-7">Разница</q-item-section>
                  <q-item-section side class="text-weight-bold" :class="deltaClass">
                    {{ deltaPrefix }}{{ formatMoney(Math.abs(summary.delta)) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="k-panel">
              <section class="k-panel__section k-panel__section--accent k-panel__section--green">
                <p class="k-panel__label">Новый лимит</p>
                <p class="k-panel__hero-value" style="font-size: 1.75rem">
                  ~{{ formatMoney(summary.new_daily_limit) }}/день
                </p>
                <p class="k-panel__hero-meta">до {{ formatDate(summary.new_limit_until) }}</p>
              </section>
            </div>

            <q-input
              v-model.number="balance"
              type="number"
              label="Баланс на сегодня, ₽"
              outlined
            />

            <q-btn
              unelevated
              color="primary"
              label="Применить"
              class="full-width k-btn-primary"
              :loading="saving"
              @click="apply"
            />
          </div>
        </template>
      </PageState>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { confirmImport, fetchImportSummary } from 'src/services/api'
import { useDashboardStore } from 'src/stores/dashboard'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const dashboard = useDashboardStore()
const { formatMoney } = useFormatMoney()
const { formatDate, formatPeriod } = useFormatDate()

const summary = ref(null)
const balance = ref(0)
const loading = ref(false)
const saving = ref(false)
const error = ref(null)

const summarySubtitle = computed(() => {
  if (!summary.value) return 'Результат сверки'
  return `${formatPeriod(summary.value.period_from, summary.value.period_to)} · ${summary.value.days_count} ${daysWord(summary.value.days_count)}`
})

const deltaClass = computed(() =>
  summary.value?.delta > 0 ? 'text-negative' : 'text-positive'
)
const deltaPrefix = computed(() =>
  summary.value?.delta > 0 ? '+' : summary.value?.delta < 0 ? '−' : ''
)

function daysWord (n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

async function load () {
  loading.value = true
  error.value = null
  try {
    summary.value = await fetchImportSummary(route.params.id)
    balance.value = summary.value.suggested_balance
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function apply () {
  saving.value = true
  try {
    const result = await confirmImport(route.params.id, balance.value)
    dashboard.setFromResponse(result)
    $q.notify({ type: 'positive', message: 'План обновлён', position: 'top' })
    router.push('/')
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
