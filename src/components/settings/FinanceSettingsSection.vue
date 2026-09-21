<template>
  <section class="k-panel__section">
    <p class="k-panel__label">Расчёт лимита</p>
    <p class="finance-settings__hint">
      Дневной лимит считается до ближайших доходов-якорей. Настройте их в разделе
      <router-link to="/incomes" class="finance-settings__link">Доходы</router-link>
      — включите «Учитывать в лимите» для зарплаты и аванса.
    </p>
    <q-input
      v-model.number="bufferAmount"
      type="number"
      label="Резерв, ₽"
      hint="Необязательная сумма, которую не тратим до следующего дохода"
      outlined
      dense
      :min="0"
      class="q-mt-md"
    />
    <q-btn
      unelevated
      color="primary"
      label="Сохранить"
      class="q-mt-md k-btn-primary"
      no-caps
      :loading="store.saving"
      @click="save"
    />
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'src/stores/settings'

const $q = useQuasar()
const store = useSettingsStore()
const bufferAmount = ref(null)

onMounted(async () => {
  if (!store.data) {
    await store.load()
  }
  bufferAmount.value = store.data?.buffer_amount ?? null
})

watch(
  () => store.data?.buffer_amount,
  (value) => {
    bufferAmount.value = value ?? null
  }
)

async function save () {
  try {
    await store.save({ buffer_amount: bufferAmount.value || null })
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}
</script>

<style scoped lang="scss">
.finance-settings__hint {
  margin: var(--k-space-1) 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--k-text-secondary);
}

.finance-settings__link {
  color: var(--k-primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
