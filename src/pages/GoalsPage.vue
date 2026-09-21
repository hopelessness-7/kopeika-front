<template>
  <q-page class="k-page k-page--list">
    <PageHeader title="Цели" subtitle="Накопления на покупки" />

    <div class="k-page-body">
      <PageState
        :loading="store.loading && !store.items.length"
        :error="store.error"
        :empty="!store.loading && !store.items.length"
        empty-text="Добавьте первую цель"
        empty-icon="flag"
        :retry="store.load"
      >
        <article
          v-for="goal in store.items"
          :key="goal.id"
          class="k-goal"
        >
          <div class="k-goal__body">
            <h3 class="k-goal__title">{{ goal.title }}</h3>
            <p class="k-goal__meta">
              {{ formatMoney(goal.saved_amount) }} / {{ formatMoney(goal.target_amount) }}
            </p>
            <q-linear-progress
              :value="progress(goal) / 100"
              size="8px"
              rounded
              color="primary"
              track-color="grey-3"
              class="q-mt-sm"
            />
            <p v-if="goal.target_date" class="k-goal__date">
              К {{ formatDate(goal.target_date) }}
            </p>
          </div>
          <div class="k-goal__actions">
            <q-btn flat round dense icon="edit" aria-label="Изменить" @click="openEdit(goal.id)" />
            <q-btn flat round dense icon="delete" color="negative" aria-label="Удалить" @click="confirmRemove(goal.id)" />
          </div>
        </article>
      </PageState>
    </div>

    <q-page-sticky position="bottom-right" :offset="[16, 88]">
      <q-btn
        fab
        unelevated
        color="primary"
        icon="add"
        class="k-fab"
        aria-label="Добавить цель"
        @click="openCreate"
      />
    </q-page-sticky>

    <q-dialog v-model="formOpen" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Редактирование' : 'Новая цель' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form class="k-stack" @submit.prevent="onSubmit">
            <q-input v-model="form.title" label="Название *" outlined dense :rules="[required]" />
            <q-input
              v-model.number="form.target_amount"
              type="number"
              label="Сумма цели, ₽ *"
              outlined
              dense
              :rules="[required, positive]"
            />
            <q-input
              v-model.number="form.saved_amount"
              type="number"
              label="Уже накоплено, ₽"
              outlined
              dense
              :min="0"
            />
            <q-input
              v-model="form.target_date"
              type="date"
              label="Желаемая дата (необязательно)"
              outlined
              dense
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
        <q-card-section class="text-body1 text-weight-medium">Удалить цель?</q-card-section>
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
import { useGoalsStore } from 'src/stores/goals'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import { useFormatMoney } from 'src/composables/useFormatMoney'
import { useFormatDate } from 'src/composables/useFormatDate'

const $q = useQuasar()
const store = useGoalsStore()
const { formatMoney } = useFormatMoney()
const { formatDate } = useFormatDate()

const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)
const confirmDelete = ref(false)
const deleteId = ref(null)

const emptyForm = () => ({
  title: '',
  target_amount: null,
  saved_amount: 0,
  target_date: null
})

const form = ref(emptyForm())

const required = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Обязательное поле'
const positive = (v) => (v > 0) || 'Больше нуля'

function progress (goal) {
  if (!goal.target_amount) return 0
  return Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100))
}

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
      target_amount: item.target_amount,
      saved_amount: item.saved_amount ?? 0,
      target_date: item.target_date || null
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
      target_amount: form.value.target_amount,
      saved_amount: form.value.saved_amount ?? 0,
      target_date: form.value.target_date || null
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

<style scoped lang="scss">
.k-goal {
  display: flex;
  gap: var(--k-space-3);
  padding: var(--k-space-4);
  background: var(--k-surface);
  border-radius: var(--k-radius-lg);
  border: 1px solid var(--k-border);
  margin-bottom: var(--k-space-3);

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  &__meta {
    margin: 4px 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--k-primary);
  }

  &__date {
    margin: 6px 0 0;
    font-size: 0.8125rem;
    color: var(--k-text-secondary);
  }

  &__actions {
    display: flex;
    flex-shrink: 0;
  }
}
</style>
