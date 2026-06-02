<template>
  <q-page class="k-page k-form">
    <PageHeader title="Настройки" subtitle="Лимит, сверка и уведомления" />

    <div class="k-page-body">
      <PageState :loading="store.loading && !store.data" :error="store.error" :retry="store.load">
        <q-form v-if="form" class="k-stack k-stack--lg" @submit="onSave">
          <div class="k-panel">
            <ThemeSection />

            <section class="k-panel__section">
              <p class="k-panel__label">Зарплата</p>
              <q-input
                v-model.number="form.salary_day_of_month"
                type="number"
                label="День выплаты (1–31)"
                outlined
                dense
                class="q-mb-sm"
              />
              <q-input
                v-model.number="form.salary_amount"
                type="number"
                label="Сумма (необязательно), ₽"
                outlined
                dense
              />
            </section>

            <div class="k-settings-grid">
              <section class="k-panel__section">
                <p class="k-panel__label">Сверка выписки</p>
                <p class="settings-hint">Как часто загружать CSV</p>
                <q-btn-toggle
                  v-model="form.import_interval_days"
                  spread
                  no-caps
                  unelevated
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-8"
                  :options="intervalToggle"
                  class="q-mb-md"
                />
                <q-select
                  v-model="form.primary_anchor"
                  :options="anchorOptions"
                  label="Основной лимит"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </section>

              <section class="k-panel__section">
                <p class="k-panel__label">Запас</p>
                <q-input
                  v-model.number="form.buffer_amount"
                  type="number"
                  label="Сумма, ₽"
                  outlined
                  dense
                  class="q-mb-sm"
                />
                <q-input
                  v-model.number="form.buffer_percent"
                  type="number"
                  label="Процент, %"
                  outlined
                  dense
                />
              </section>
            </div>

            <section class="k-panel__section">
              <q-select
                v-model="form.notification_mode"
                :options="notifyOptions"
                label="Уведомления"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-sm"
              />
              <div class="settings-import-row">
                <div>
                  <div class="settings-import-row__label">Последний импорт</div>
                  <div class="settings-import-row__value">{{ form.last_import_at || 'ещё не было' }}</div>
                </div>
                <q-btn
                  outline
                  no-caps
                  color="primary"
                  label="Загрузить"
                  icon="upload_file"
                  size="sm"
                  to="/import"
                />
              </div>
            </section>
          </div>

          <q-btn
            type="submit"
            unelevated
            color="primary"
            label="Сохранить настройки"
            class="full-width k-btn-primary"
            :loading="store.saving"
          />
        </q-form>
      </PageState>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'src/stores/settings'
import PageHeader from 'src/components/common/PageHeader.vue'
import PageState from 'src/components/common/PageState.vue'
import ThemeSection from 'src/components/settings/ThemeSection.vue'

const $q = useQuasar()
const store = useSettingsStore()
const form = ref(null)

const intervalToggle = [
  { label: '7 дн.', value: 7 },
  { label: '10 дн.', value: 10 },
  { label: '14 дн.', value: 14 }
]

const anchorOptions = [
  { label: 'Авто — что ближе', value: 'auto' },
  { label: 'До зарплаты', value: 'salary' },
  { label: 'До сверки', value: 'import' }
]

const notifyOptions = [
  { label: 'Тихий режим', value: 'quiet' },
  { label: 'Обычные', value: 'normal' },
  { label: 'Только платежи', value: 'payments_only' }
]

watch(
  () => store.data,
  (data) => {
    if (data) form.value = { ...data }
  },
  { immediate: true }
)

onMounted(() => store.load())

async function onSave () {
  try {
    await store.save(form.value)
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}
</script>

<style scoped>
.settings-hint {
  margin: -4px 0 var(--k-space-3);
  font-size: 0.8125rem;
  color: var(--k-text-secondary);
}

.settings-import-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--k-space-3);
  padding-top: var(--k-space-2);

  &__label {
    font-size: 0.75rem;
    color: var(--k-text-muted);
  }

  &__value {
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 2px;
  }
}
</style>
