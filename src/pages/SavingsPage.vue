<template>
  <q-page class="k-page k-page--list">
    <PageHeader title="Накопления" subtitle="Счета и ежемесячные пополнения" />

    <div class="k-page-body">
      <PageState
        :loading="store.loading && !store.items.length"
        :error="store.error"
        :empty="!store.loading && !store.items.length"
        empty-text="Добавьте счёт накоплений"
        empty-icon="savings"
        :retry="store.load"
      >
        <SavingCard
          v-for="item in store.items"
          :key="item.id"
          :saving="item"
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
        aria-label="Добавить накопление"
        @click="openCreate"
      />
    </q-page-sticky>

    <q-dialog v-model="formOpen" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Редактирование' : 'Новое накопление' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form class="k-stack" @submit.prevent="onSubmit">
            <q-input v-model="form.title" label="Заголовок *" outlined dense :rules="[required]" />
            <q-input v-model="form.bank" label="Банк *" outlined dense :rules="[required]" />
            <q-input
              v-model.number="form.balance"
              type="number"
              label="Сумма на счёте, ₽ *"
              outlined
              dense
              :rules="[required, nonNegative]"
            />
            <q-input
              v-model.number="form.monthly_contribution"
              type="number"
              label="Пополнение в месяц, ₽ *"
              outlined
              dense
              :rules="[required, nonNegative]"
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
        <q-card-section class="text-body1 text-weight-medium">Удалить накопление?</q-card-section>
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
import { useSavingsStore } from 'src/stores/savings'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import SavingCard from 'src/components/savings/SavingCard.vue'

const $q = useQuasar()
const store = useSavingsStore()

const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const confirmDelete = ref(false)
const deleteId = ref(null)

const emptyForm = () => ({
  title: '',
  bank: '',
  balance: 0,
  monthly_contribution: 0
})

const form = ref(emptyForm())

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Обязательное поле'
const nonNegative = (v) => (v >= 0) || 'Не меньше нуля'

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
      bank: item.bank,
      balance: item.balance,
      monthly_contribution: item.monthly_contribution
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
      bank: form.value.bank.trim(),
      balance: form.value.balance,
      monthly_contribution: form.value.monthly_contribution
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
