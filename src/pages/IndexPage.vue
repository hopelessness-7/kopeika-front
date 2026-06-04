<template>
  <q-page class="k-page k-page--dashboard">
    <PageHeader title="Сегодня" :subtitle="todayLabel" />

    <div class="k-page-body">
      <q-pull-to-refresh @refresh="onRefresh">
        <PageState
          :loading="store.loading && !store.data"
          :error="store.error"
          :retry="store.load"
        >
          <DashboardPanel
            v-if="store.data"
            :data="store.data"
            @update-balance="balanceDialog = true"
            @check-in="$router.push('/check-in')"
            @import="$router.push('/reconciliation')"
            @incomes="$router.push('/incomes')"
            @savings="$router.push('/savings')"
            @settings="$router.push('/settings')"
          />
        </PageState>
      </q-pull-to-refresh>
    </div>

    <q-dialog v-model="balanceDialog" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">Счёт</div>
          <q-input
            v-model.number="balanceInput"
            type="number"
            label="Сумма, ₽"
            outlined
            class="q-mt-md"
            autofocus
          />
        </q-card-section>
        <q-card-actions class="q-px-md q-pb-md row q-col-gutter-sm">
          <q-btn flat label="Отмена" v-close-popup class="col" />
          <q-btn
            unelevated
            color="primary"
            label="Сохранить"
            class="col k-btn-primary"
            :loading="balanceSaving"
            @click="saveBalance"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useDashboardStore } from 'src/stores/dashboard'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import DashboardPanel from 'src/components/dashboard/DashboardPanel.vue'

const $q = useQuasar()
const store = useDashboardStore()

const balanceDialog = ref(false)
const balanceInput = ref(0)
const balanceSaving = ref(false)

const todayLabel = computed(() => {
  const s = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
})

watch(balanceDialog, (open) => {
  if (open && store.data) balanceInput.value = store.data.balance
})

onMounted(() => {
  if (!store.data) store.load()
})

async function onRefresh (done) {
  await store.load()
  done()
}

async function saveBalance () {
  balanceSaving.value = true
  try {
    await store.setBalance(balanceInput.value)
    balanceDialog.value = false
    $q.notify({ type: 'positive', message: 'Счёт обновлён', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    balanceSaving.value = false
  }
}
</script>
