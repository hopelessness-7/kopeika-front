<template>
  <q-page class="k-page k-page--list">
    <PageHeader title="Доходы" subtitle="Источники и поступления" />

    <div class="k-page-body">
      <PageState
        :loading="store.loading && !store.items.length"
        :error="store.error"
        :empty="!store.loading && !store.items.length"
        empty-text="Добавьте первый доход"
        empty-icon="payments"
        :retry="store.load"
      >
        <IncomeCard
          v-for="item in store.items"
          :key="item.id"
          :income="item"
          @edit="openEdit"
          @remove="confirmRemove"
        />
      </PageState>
    </div>

    <q-page-sticky position="bottom-right" :offset="[16, 88]">
      <q-btn
        fab
        unelevated
        color="primary"
        icon="add"
        class="k-fab"
        aria-label="Добавить доход"
        @click="openCreate"
      />
    </q-page-sticky>

    <q-dialog v-model="formOpen" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Редактирование' : 'Новый доход' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form class="k-stack" @submit.prevent="onSubmit">
            <q-input v-model="form.title" label="Заголовок *" outlined dense :rules="[required]" />
            <q-input v-model="form.description" label="Описание" outlined dense type="textarea" autogrow />
            <q-input
              v-model.number="form.amount"
              type="number"
              label="Сумма, ₽ *"
              outlined
              dense
              :rules="[required, positive]"
            />
            <q-toggle
              v-model="form.is_recurring"
              label="Регулярный (ежемесячно)"
              color="primary"
            />
            <q-input
              v-if="form.is_recurring"
              v-model.number="form.day_of_month"
              type="number"
              label="День месяца (1–31) *"
              outlined
              dense
              :rules="[required, dayRule]"
            />
            <q-input
              v-model="form.received_at"
              type="date"
              :label="form.is_recurring ? 'Дата последнего поступления' : 'Дата *'"
              outlined
              dense
              :rules="form.is_recurring ? [] : [required]"
            />
            <q-btn
              type="submit"
              unelevated
              color="primary"
              :label="editingId ? 'Сохранить' : 'Добавить'"
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

    <q-dialog v-model="confirmDelete">
      <q-card class="k-panel" style="min-width: 300px">
        <q-card-section class="text-body1 text-weight-medium">Удалить доход?</q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup no-caps />
          <q-btn unelevated color="negative" label="Удалить" no-caps @click="doRemove" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useIncomesStore } from 'src/stores/incomes'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import IncomeCard from 'src/components/incomes/IncomeCard.vue'

const $q = useQuasar()
const store = useIncomesStore()

const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const confirmDelete = ref(false)
const deleteId = ref(null)

const emptyForm = () => ({
  title: '',
  description: '',
  amount: null,
  received_at: new Date().toISOString().slice(0, 10),
  is_recurring: false,
  day_of_month: null
})

const form = ref(emptyForm())

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Обязательное поле'
const positive = (v) => (v > 0) || 'Больше нуля'
const dayRule = (v) => (v >= 1 && v <= 31) || 'От 1 до 31'

onMounted(() => store.load())

function openCreate () {
  editingId.value = null
  form.value = emptyForm()
  formOpen.value = true
}

async function openEdit (id) {
  try {
    const item = await store.loadOne(id)
    editingId.value = id
    form.value = {
      title: item.title,
      description: item.description || '',
      amount: item.amount,
      received_at: item.received_at,
      is_recurring: Boolean(item.is_recurring),
      day_of_month: item.day_of_month ?? null
    }
    formOpen.value = true
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

async function onSubmit () {
  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      description: form.value.description?.trim() || null,
      amount: form.value.amount,
      received_at: form.value.received_at || new Date().toISOString().slice(0, 10),
      is_recurring: form.value.is_recurring,
      day_of_month: form.value.is_recurring ? form.value.day_of_month : null
    }
    if (editingId.value) {
      await store.update(editingId.value, payload)
    } else {
      await store.create(payload)
    }
    formOpen.value = false
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    saving.value = false
  }
}

function confirmRemove (id) {
  deleteId.value = id
  confirmDelete.value = true
}

async function doRemove () {
  try {
    await store.remove(deleteId.value)
    $q.notify({ type: 'positive', message: 'Удалено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    confirmDelete.value = false
  }
}
</script>
