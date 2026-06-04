<template>
  <q-page class="k-page k-form">
    <PageHeader title="Сверка" subtitle="Выписки и лимит до следующей загрузки" />

    <div class="k-page-body k-stack">
      <PageState :loading="store.loading && !store.settings" :error="store.error" :retry="store.load">
        <template v-if="store.settings">
          <div v-if="!hasImports" class="k-panel">
            <section class="k-panel__section">
              <ReconciliationSettingsFields v-model="settingsForm" />
              <q-btn
                unelevated
                color="primary"
                label="Сохранить настройки"
                class="full-width k-btn-primary q-mt-md"
                no-caps
                :loading="store.savingSettings"
                @click="saveSettings"
              />
            </section>
            <section class="k-panel__section">
              <p class="k-panel__label">Первая выписка</p>
              <q-option-group v-model="bank" :options="bankOptions" type="radio" color="primary" class="q-mb-md" />
              <q-file v-model="file" accept=".csv,.txt" label="CSV выписки" outlined>
                <template #prepend>
                  <q-icon name="upload_file" />
                </template>
              </q-file>
              <q-btn
                unelevated
                color="primary"
                label="Загрузить"
                class="full-width k-btn-primary q-mt-md"
                no-caps
                :loading="uploading"
                :disable="!file"
                @click="doUploadFirst"
              />
            </section>
          </div>

          <template v-else>
            <div class="k-panel">
              <section class="k-panel__section">
                <ReconciliationImportCard
                  v-for="item in store.imports"
                  :key="item.id"
                  :item="item"
                />
              </section>
            </div>
          </template>
        </template>
      </PageState>
    </div>

    <q-page-sticky v-if="hasImports" position="bottom-right" :offset="[16, 88]">
      <q-btn
        fab
        unelevated
        color="primary"
        icon="add"
        class="k-fab"
        aria-label="Загрузить выписку"
        @click="uploadOpen = true"
      />
    </q-page-sticky>

    <q-dialog v-model="uploadOpen" position="bottom">
      <q-card class="k-sheet" style="min-width: 100%">
        <q-card-section>
          <div class="text-h6">Загрузить выписку</div>
        </q-card-section>
        <q-card-section class="q-pt-none k-stack">
          <q-option-group v-model="bank" :options="bankOptions" type="radio" color="primary" />
          <q-file v-model="file" accept=".csv,.txt" label="CSV" outlined>
            <template #prepend>
              <q-icon name="upload_file" />
            </template>
          </q-file>
        </q-card-section>
        <q-card-actions class="q-px-md q-pb-md row q-col-gutter-sm">
          <q-btn flat label="Отмена" v-close-popup class="col" no-caps />
          <q-btn
            unelevated
            color="primary"
            label="Загрузить"
            class="col k-btn-primary"
            no-caps
            :loading="uploading"
            :disable="!file"
            @click="doUpload"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useReconciliationStore } from 'src/stores/reconciliation'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import ReconciliationImportCard from 'src/components/reconciliation/ReconciliationImportCard.vue'
import ReconciliationSettingsFields from 'src/components/reconciliation/ReconciliationSettingsFields.vue'

const router = useRouter()
const $q = useQuasar()
const store = useReconciliationStore()

const settingsForm = ref(null)
const bank = ref('sber')
const file = ref(null)
const uploading = ref(false)
const uploadOpen = ref(false)

const bankOptions = [
  { label: 'Сбербанк', value: 'sber' }
]

const hasImports = computed(() => store.imports.length > 0)

watch(
  () => store.settings,
  (v) => {
    if (v) settingsForm.value = { ...v }
  },
  { immediate: true }
)

onMounted(() => store.load())

async function saveSettings () {
  try {
    await store.saveSettings(settingsForm.value)
    $q.notify({ type: 'positive', message: 'Настройки сохранены', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

async function doUploadFirst () {
  await runUpload(true)
}

async function doUpload () {
  await runUpload(false)
}

async function runUpload (goToDetail) {
  if (!file.value) return
  uploading.value = true
  try {
    const result = await store.upload(bank.value, file.value)
    file.value = null
    uploadOpen.value = false
    $q.notify({ type: 'positive', message: 'Выписка загружена', position: 'top' })
    if (goToDetail) {
      await router.push(`/reconciliation/${result.id}`)
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    uploading.value = false
  }
}
</script>
