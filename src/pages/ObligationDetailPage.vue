<template>
  <q-page class="k-page k-page--detail">
    <PageHeader
      :title="obligation?.title || 'Обязательство'"
      :subtitle="typeLabel"
      back
      back-to="/obligations"
    />

    <div class="k-page-body">
      <PageState
        :loading="store.detailLoading && !obligation"
        :error="store.detailError"
        :retry="reload"
      >
        <template v-if="obligation">
          <section class="k-panel obligation-detail__head">
            <div class="k-panel__section">
              <p class="k-panel__label">Платёж</p>
              <p class="k-panel__hero-value">{{ formatMoney(obligation.payment_amount) }}</p>
              <p class="k-panel__hero-meta">
                {{ obligation.payment_day }}-е число
                <span v-if="obligation.next_payment_date">
                  · ближайший {{ formatDate(obligation.next_payment_date) }}
                </span>
              </p>
            </div>

            <div v-if="hasProgress" class="k-panel__section">
              <div class="obligation-detail__progress-row">
                <span>Погашено</span>
                <span class="text-weight-medium">{{ summary.progress_percent }}%</span>
              </div>
              <q-linear-progress
                :value="(summary.progress_percent || 0) / 100"
                size="10px"
                rounded
                color="primary"
                track-color="grey-3"
                class="q-mt-sm"
              />
              <div class="obligation-detail__progress-meta">
                {{ formatMoney(paidAmount) }} из {{ formatMoney(obligation.total_amount) }}
                <span v-if="summary.progress_basis === 'balance'"> · по остатку</span>
              </div>
            </div>

            <div class="k-panel__section k-cols-2 obligation-detail__metrics">
              <div class="k-metric">
                <div class="k-metric__label">Остаток</div>
                <div class="k-metric__value">
                  {{ obligation.remaining_amount != null ? formatMoney(obligation.remaining_amount) : '—' }}
                </div>
              </div>
              <div class="k-metric">
                <div class="k-metric__label">В этом месяце</div>
                <div class="k-metric__value">{{ formatMoney(summary?.paid_this_month || 0) }}</div>
              </div>
              <div class="k-metric">
                <div class="k-metric__label">За год</div>
                <div class="k-metric__value">{{ formatMoney(summary?.paid_this_year || 0) }}</div>
              </div>
              <div class="k-metric">
                <div class="k-metric__label">Всего платежей</div>
                <div class="k-metric__value">{{ summary?.payments_count || 0 }}</div>
              </div>
            </div>

            <div v-if="extraInfo.length" class="k-panel__section obligation-detail__info">
              <div v-for="row in extraInfo" :key="row.label" class="obligation-detail__info-row">
                <span class="obligation-detail__info-label">{{ row.label }}</span>
                <span class="obligation-detail__info-value">{{ row.value }}</span>
              </div>
            </div>

            <div class="k-panel__section obligation-detail__actions">
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Внести платёж"
                class="k-btn-primary"
                no-caps
                :disable="!obligation.is_active"
                @click="openPaymentForm"
              />
              <q-btn
                v-if="obligation.is_active && canCloseEarly"
                outline
                color="primary"
                icon="task_alt"
                label="Закрыть досрочно"
                no-caps
                @click="confirmClose = true"
              />
              <q-btn
                v-if="!obligation.is_active"
                outline
                color="primary"
                icon="restart_alt"
                label="Возобновить"
                no-caps
                @click="onReopen"
              />
              <q-btn
                outline
                color="primary"
                icon="edit"
                label="Изменить"
                no-caps
                :to="`/obligations/${obligation.id}/edit`"
              />
            </div>
          </section>

          <section v-if="summary?.monthly?.length" class="k-panel obligation-detail__monthly">
            <div class="k-panel__section">
              <p class="k-panel__label">Помесячно</p>
              <ul class="obligation-detail__monthly-list">
                <li v-for="row in summary.monthly" :key="row.month">
                  <span>{{ formatMonth(row.month) }}</span>
                  <span class="text-weight-medium">{{ formatMoney(row.total) }}</span>
                </li>
              </ul>
            </div>
          </section>

          <section class="k-panel obligation-detail__history">
            <div class="k-panel__section">
              <p class="k-panel__label">История платежей</p>
              <div v-if="!store.payments.length" class="obligation-detail__empty">
                Платежей пока нет
              </div>
              <ul v-else class="obligation-detail__history-list">
                <li v-for="payment in store.payments" :key="payment.id">
                  <div class="obligation-detail__history-row">
                    <div>
                      <div class="obligation-detail__history-amount">
                        {{ formatMoney(payment.amount) }}
                      </div>
                      <div class="obligation-detail__history-meta">
                        {{ formatDate(payment.paid_at || payment.due_date) }}
                        · {{ statusLabel(payment.status) }}
                      </div>
                      <div v-if="payment.note" class="obligation-detail__history-note">
                        {{ payment.note }}
                      </div>
                    </div>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      aria-label="Удалить платёж"
                      @click="confirmDelete(payment)"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </template>
      </PageState>
    </div>

    <q-dialog v-model="paymentForm" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">Платёж</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form class="k-stack" @submit.prevent="onSubmitPayment">
            <q-input
              v-model.number="form.amount"
              type="number"
              label="Сумма, ₽ *"
              outlined
              dense
              :rules="[required, positive]"
            />
            <q-input
              v-model="form.paid_at"
              type="date"
              label="Дата платежа *"
              outlined
              dense
              :rules="[required]"
            />
            <q-input
              v-model="form.note"
              label="Комментарий"
              outlined
              dense
              type="textarea"
              autogrow
            />
            <q-btn
              type="submit"
              unelevated
              color="primary"
              label="Сохранить"
              class="full-width k-btn-primary"
              :loading="saving"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Отмена" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmClose">
      <q-card class="k-panel" style="min-width: 300px">
        <q-card-section class="text-body1 text-weight-medium">
          Закрыть обязательство досрочно?
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup no-caps />
          <q-btn unelevated color="primary" label="Закрыть" no-caps @click="onClose" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteDialog">
      <q-card class="k-panel" style="min-width: 300px">
        <q-card-section class="text-body1 text-weight-medium">
          Удалить запись о платеже?
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup no-caps />
          <q-btn unelevated color="negative" label="Удалить" no-caps @click="onDeletePayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useObligationsStore } from 'src/stores/obligations'
import { OBLIGATION_TYPE_LABELS } from 'src/types/api'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useObligationsStore()
const { formatMoney } = useFormatMoney()
const { formatDate } = useFormatDate()

const obligation = computed(() => store.detail)
const summary = computed(() => obligation.value?.summary || null)

const paymentForm = ref(false)
const confirmClose = ref(false)
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const saving = ref(false)

const form = ref(emptyForm())

function emptyForm () {
  return {
    amount: null,
    paid_at: new Date().toISOString().slice(0, 10),
    note: ''
  }
}

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Обязательное поле'
const positive = (v) => v > 0 || 'Больше нуля'

const typeLabel = computed(() => {
  const t = obligation.value?.type
  return t ? OBLIGATION_TYPE_LABELS[t] || t : ''
})

const hasProgress = computed(
  () => summary.value?.progress_percent != null && obligation.value?.total_amount
)

const paidAmount = computed(() => {
  if (summary.value?.paid_amount != null) {
    return summary.value.paid_amount
  }
  if (obligation.value?.paid_amount != null) {
    return obligation.value.paid_amount
  }
  return summary.value?.total_paid || 0
})

const canCloseEarly = computed(() => {
  if (!obligation.value) return false
  const remaining = obligation.value.remaining_amount
  return remaining == null || remaining > 0
})

const extraInfo = computed(() => {
  if (!obligation.value) return []
  const o = obligation.value
  const rows = []
  if (o.lender) rows.push({ label: 'Кому / банк', value: o.lender })
  if (o.interest_rate != null) rows.push({ label: 'Ставка', value: `${o.interest_rate}%` })
  if (o.starts_at) rows.push({ label: 'С', value: formatDate(o.starts_at) })
  if (o.ends_at) rows.push({ label: 'До', value: formatDate(o.ends_at) })
  if (o.note) rows.push({ label: 'Заметка', value: o.note })
  if (!o.is_active) rows.push({ label: 'Статус', value: 'Закрыто' })
  return rows
})

onMounted(reload)

async function reload () {
  try {
    await store.loadDetail(route.params.id)
  } catch {
    router.replace('/obligations')
  }
}

function openPaymentForm () {
  form.value = emptyForm()
  if (obligation.value?.payment_amount) {
    form.value.amount = obligation.value.payment_amount
  }
  if (obligation.value?.next_payment_date) {
    form.value.paid_at = obligation.value.next_payment_date
  }
  paymentForm.value = true
}

async function onSubmitPayment () {
  saving.value = true
  try {
    const dueDate = obligation.value?.next_payment_date || form.value.paid_at
    const payload = {
      amount: form.value.amount,
      paid_at: form.value.paid_at,
      due_date: dueDate,
      note: form.value.note?.trim() || null,
      status: 'paid'
    }
    await store.addPayment(route.params.id, payload)
    paymentForm.value = false
    $q.notify({ type: 'positive', message: 'Платёж сохранён', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    saving.value = false
  }
}

function confirmDelete (payment) {
  deleteTarget.value = payment.id
  deleteDialog.value = true
}

async function onDeletePayment () {
  try {
    await store.removePayment(route.params.id, deleteTarget.value)
    $q.notify({ type: 'positive', message: 'Платёж удалён', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    deleteDialog.value = false
  }
}

async function onClose () {
  try {
    await store.close(route.params.id)
    $q.notify({ type: 'positive', message: 'Обязательство закрыто', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    confirmClose.value = false
  }
}

async function onReopen () {
  try {
    await store.reopen(route.params.id)
    $q.notify({ type: 'positive', message: 'Возобновлено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

function statusLabel (status) {
  if (status === 'paid') return 'оплачен'
  if (status === 'planned') return 'запланирован'
  if (status === 'skipped') return 'пропущен'
  return status
}

function formatMonth (key) {
  if (!key) return ''
  const [year, month] = key.split('-').map(Number)
  if (!year || !month) return key
  return new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1))
}
</script>

<style scoped lang="scss">
.obligation-detail__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--k-text-secondary);
}

.obligation-detail__progress-meta {
  margin-top: 4px;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}

.obligation-detail__metrics {
  gap: var(--k-space-3);
}

.obligation-detail__info {
  display: grid;
  gap: var(--k-space-2);
}

.obligation-detail__info-row {
  display: flex;
  justify-content: space-between;
  gap: var(--k-space-3);
  font-size: 0.875rem;
}

.obligation-detail__info-label {
  color: var(--k-text-secondary);
}

.obligation-detail__info-value {
  text-align: right;
  font-weight: 500;
}

.obligation-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--k-space-2);
}

.obligation-detail__monthly-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--k-space-2);
  font-size: 0.875rem;
}

.obligation-detail__monthly-list li {
  display: flex;
  justify-content: space-between;
}

.obligation-detail__history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--k-space-3);
}

.obligation-detail__history-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--k-space-3);
}

.obligation-detail__history-amount {
  font-weight: 600;
}

.obligation-detail__history-meta {
  margin-top: 2px;
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}

.obligation-detail__history-note {
  margin-top: 4px;
  font-size: 0.8125rem;
}

.obligation-detail__empty {
  font-size: 0.875rem;
  color: var(--k-text-secondary);
}
</style>
