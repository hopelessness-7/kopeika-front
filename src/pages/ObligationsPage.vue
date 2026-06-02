<template>
  <q-page class="k-page k-page--list">
    <PageHeader title="Долги" subtitle="Активные платежи и обязательства" />

    <div class="k-page-body">
      <PageState
        :loading="store.loading && !store.items.length"
        :error="store.error"
        :empty="!store.loading && !store.items.length"
        empty-text="Добавьте первое обязательство"
        empty-icon="account_balance_wallet"
        :retry="store.load"
      >
        <div class="k-obligations-grid">
          <ObligationCard
            v-for="item in store.items"
            :key="item.id"
            :obligation="item"
            @archive="onArchive"
          />
        </div>
      </PageState>
    </div>

    <q-page-sticky position="bottom-right" :offset="[16, 88]">
      <q-btn
        fab
        unelevated
        color="primary"
        icon="add"
        class="k-fab"
        aria-label="Добавить"
        to="/obligations/new"
      />
    </q-page-sticky>

    <q-dialog v-model="confirmArchive">
      <q-card class="k-panel" style="min-width: 300px">
        <q-card-section class="text-body1 text-weight-medium">
          Архивировать обязательство?
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Отмена" v-close-popup no-caps />
          <q-btn unelevated color="negative" label="Архивировать" no-caps @click="doArchive" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useObligationsStore } from 'src/stores/obligations'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import ObligationCard from 'src/components/obligations/ObligationCard.vue'

const $q = useQuasar()
const store = useObligationsStore()
const confirmArchive = ref(false)
const archiveId = ref(null)

onMounted(() => store.load())

function onArchive (id) {
  archiveId.value = id
  confirmArchive.value = true
}

async function doArchive () {
  try {
    await store.archive(archiveId.value)
    $q.notify({ type: 'positive', message: 'Архивировано', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    confirmArchive.value = false
  }
}
</script>
