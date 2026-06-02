<template>
  <q-page class="k-page k-form">
    <PageHeader title="Сверка" subtitle="CSV из банка — факт против плана" />

    <div class="k-page-body k-stack">
      <div class="k-panel">
        <section class="k-panel__section">
          <p class="k-panel__label">Банк</p>
          <q-option-group
            v-model="bank"
            :options="bankOptions"
            type="radio"
            color="primary"
          />
        </section>

        <section class="k-panel__section">
          <q-file
            v-model="file"
            accept=".csv"
            label="Файл выписки (.csv)"
            outlined
            :disable="bank === 'yandex_pay'"
          >
            <template #prepend>
              <q-icon name="upload_file" />
            </template>
          </q-file>
        </section>
      </div>

      <q-btn
        unelevated
        color="primary"
        label="Загрузить"
        class="full-width k-btn-primary"
        :loading="uploading"
        :disable="!file || bank === 'yandex_pay'"
        @click="upload"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { pollImportUntilDone, uploadImport } from 'src/services/api'
import PageHeader from 'src/components/common/PageHeader.vue'

const router = useRouter()
const $q = useQuasar()

const bank = ref('sber')
const file = ref(null)
const uploading = ref(false)

const bankOptions = [
  { label: 'Сбербанк', value: 'sber' },
  { label: 'Яндекс Пэй (скоро)', value: 'yandex_pay', disable: true }
]

async function upload () {
  if (!file.value) return
  uploading.value = true
  try {
    const result = await uploadImport(bank.value, file.value)
    let final = result
    if (result.status === 'processing') {
      final = await pollImportUntilDone(result.id)
    }
    if (final.status === 'failed') {
      throw new Error(final.error_message || 'Импорт не удался')
    }
    router.push(`/import/${result.id}/summary`)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    uploading.value = false
  }
}
</script>
