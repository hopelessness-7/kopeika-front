<template>
  <q-page class="k-page k-form">
    <PageHeader
      :title="isEdit ? 'Редактирование' : 'Новое обязательство'"
      subtitle="Платёж и остаток долга"
      back
      back-to="/obligations"
    />

    <div class="k-page-body">
      <q-form class="k-panel" @submit="onSubmit">
        <section class="k-panel__section k-form-split">
          <q-input
            v-model="form.title"
            label="Название *"
            outlined
            class="q-mb-md form-field--full"
            :rules="[required]"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Тип *"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-input
            v-model.number="form.payment_amount"
            type="number"
            label="Сумма платежа, ₽ *"
            outlined
            class="q-mb-md"
            :rules="[required, positive]"
          />

          <q-input
            v-model.number="form.payment_day"
            type="number"
            label="День платежа (1–31) *"
            outlined
            class="q-mb-md"
            :rules="[required, dayRule]"
          />

          <q-input
            v-model.number="form.remaining_amount"
            type="number"
            label="Остаток долга, ₽"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model.number="form.total_amount"
            type="number"
            label="Общая сумма, ₽"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model.number="form.interest_rate"
            type="number"
            label="Ставка, %"
            outlined
            class="q-mb-md"
          />

          <q-input v-model="form.lender" label="Кому / банк" outlined class="q-mb-md" />

          <q-toggle v-model="form.is_active" label="Активно" class="q-mb-md form-field--full" />

          <q-input
            v-model="form.note"
            type="textarea"
            label="Заметка"
            outlined
            class="q-mb-lg form-field--full"
          />

          <div class="row q-col-gutter-sm form-actions-row">
            <div class="col">
              <q-btn
                outline
                color="primary"
                label="Отмена"
                class="full-width form-actions__btn"
                no-caps
                type="button"
                @click="router.push('/obligations')"
              />
            </div>
            <div class="col">
              <q-btn
                type="submit"
                unelevated
                color="primary"
                :label="isEdit ? 'Сохранить' : 'Добавить'"
                class="full-width k-btn-primary form-actions__btn"
                :loading="saving"
                no-caps
              />
            </div>
          </div>
        </section>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { OBLIGATION_TYPES, OBLIGATION_TYPE_LABELS } from 'src/types/api'
import { useObligationsStore } from 'src/stores/obligations'
import PageHeader from 'src/components/common/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useObligationsStore()

const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)

const typeOptions = OBLIGATION_TYPES.map((value) => ({
  value,
  label: OBLIGATION_TYPE_LABELS[value]
}))

const form = ref({
  title: '',
  type: 'loan',
  payment_amount: null,
  payment_day: 1,
  remaining_amount: null,
  total_amount: null,
  interest_rate: null,
  lender: '',
  note: '',
  is_active: true
})

const required = (v) => (v !== '' && v != null) || 'Обязательное поле'
const positive = (v) => v > 0 || 'Укажите сумму больше 0'
const dayRule = (v) => (v >= 1 && v <= 31) || 'От 1 до 31'

onMounted(async () => {
  if (isEdit.value) {
    try {
      const item = await store.loadOne(route.params.id)
      form.value = {
        title: item.title,
        type: item.type,
        payment_amount: item.payment_amount,
        payment_day: item.payment_day,
        remaining_amount: item.remaining_amount,
        total_amount: item.total_amount,
        interest_rate: item.interest_rate,
        lender: item.lender || '',
        note: item.note || '',
        is_active: item.is_active
      }
    } catch {
      router.replace('/obligations')
    }
  }
})

async function onSubmit () {
  saving.value = true
  const payload = {
    ...form.value,
    lender: form.value.lender || null,
    note: form.value.note || null
  }
  try {
    if (isEdit.value) {
      await store.update(route.params.id, payload)
    } else {
      await store.create(payload)
    }
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
    router.push('/obligations')
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-actions__btn {
  min-height: 48px;
}
</style>
