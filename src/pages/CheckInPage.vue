<template>
  <q-page class="k-page checkin-page">
    <PageHeader title="Быстрая сверка" subtitle="Пара вопросов — план обновится" back back-to="/" />

    <div class="k-page-body k-panel">
      <section class="k-panel__section">
      <q-stepper v-model="step" vertical color="primary" animated flat class="k-stepper">
        <q-step :name="1" title="Баланс" icon="account_balance_wallet" :done="step > 1">
          <p class="step-text">
            Баланс всё ещё <strong>{{ formatMoney(balance) }}</strong>?
          </p>
          <div class="row q-gutter-sm q-mt-md">
            <q-btn unelevated color="primary" label="Да" class="k-btn-primary" @click="confirmBalance(true)" />
            <q-btn outline color="primary" label="Изменить" no-caps @click="showBalanceInput = true" />
          </div>
          <q-input
            v-if="showBalanceInput"
            v-model.number="newBalance"
            type="number"
            label="Новый баланс, ₽"
            outlined
            class="q-mt-md"
          />
          <q-btn
            v-if="showBalanceInput"
            unelevated
            class="q-mt-sm k-btn-primary"
            color="primary"
            label="Далее"
            @click="confirmBalance(false)"
          />
        </q-step>

        <q-step :name="2" title="Крупные траты" icon="shopping_cart" :done="step > 2">
          <p class="step-text">Были крупные траты с прошлой сверки?</p>
          <div class="row q-gutter-sm q-mt-md">
            <q-btn unelevated color="primary" label="Нет" class="k-btn-primary" @click="setExpense(null)" />
            <q-btn outline color="primary" label="Указать сумму" no-caps @click="showExpenseInput = true" />
          </div>
          <q-input
            v-if="showExpenseInput"
            v-model.number="expenseAmount"
            type="number"
            label="Сумма, ₽"
            outlined
            class="q-mt-md"
          />
          <q-btn
            v-if="showExpenseInput"
            unelevated
            class="q-mt-sm k-btn-primary"
            color="primary"
            label="Готово"
            @click="setExpense(expenseAmount)"
          />
        </q-step>

        <q-step :name="3" title="Готово" icon="done_all">
          <p class="step-text step-text--done">План обновлён</p>
          <p v-if="streakWeeks" class="streak-text">{{ streakLabel }}</p>
          <q-btn
            unelevated
            class="q-mt-lg k-btn-primary full-width"
            color="primary"
            label="На главную"
            to="/"
          />
        </q-step>
      </q-stepper>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from 'src/components/common/PageHeader.vue'
import { submitCheckIn } from 'src/services/api'
import { useDashboardStore } from 'src/stores/dashboard'
import { useFormatMoney } from 'src/composables/useFormatMoney'

const $q = useQuasar()
const dashboard = useDashboardStore()
const { formatMoney } = useFormatMoney()

const step = ref(1)
const balance = ref(0)
const newBalance = ref(0)
const showBalanceInput = ref(false)
const showExpenseInput = ref(false)
const expenseAmount = ref(null)
const balanceConfirmed = ref(true)
const streakWeeks = ref(0)

const streakLabel = computed(() => {
  const n = streakWeeks.value
  if (!n) return ''
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'сверок'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'сверка'
    else if (mod10 >= 2 && mod10 <= 4) word = 'сверки'
  }
  return `${n} ${word} подряд в срок`
})

onMounted(async () => {
  if (!dashboard.data) await dashboard.load()
  balance.value = dashboard.data?.balance ?? 0
  newBalance.value = balance.value
})

function confirmBalance (confirmed) {
  balanceConfirmed.value = confirmed
  if (!confirmed) balance.value = newBalance.value
  step.value = 2
}

async function setExpense (amount) {
  try {
    const result = await submitCheckIn({
      balance_confirmed: balanceConfirmed.value,
      balance_amount: balanceConfirmed.value ? undefined : balance.value,
      large_expense_amount: amount
    })
    dashboard.setFromResponse(result)
    streakWeeks.value = result.streak?.check_in_weeks ?? 0
    step.value = 3
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}
</script>

<style scoped lang="scss">
.step-text {
  font-size: 0.9375rem;
  color: var(--k-text-secondary);
  line-height: 1.5;
  margin: 0;

  strong {
    color: var(--k-text);
    font-weight: 700;
  }

  &--done {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--k-text);
  }
}

.streak-text {
  margin: 8px 0 0;
  font-size: 0.875rem;
  color: var(--k-text-muted);
}

:deep(.k-stepper) {
  background: transparent;

  .q-stepper__title {
    font-weight: 600;
    letter-spacing: -0.01em;
  }
}
</style>
