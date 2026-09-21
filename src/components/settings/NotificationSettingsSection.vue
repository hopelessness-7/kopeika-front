<template>
  <section class="k-panel__section">
    <p class="k-panel__label">Уведомления</p>
    <p class="notification-settings__hint">
      Напоминания о платежах и еженедельной сверке баланса.
    </p>
    <q-option-group
      v-model="mode"
      :options="options"
      type="radio"
      color="primary"
      class="q-mt-md"
    />
    <q-btn
      v-if="pushSupported"
      outline
      color="primary"
      :label="pushEnabled ? 'Отключить push' : 'Включить push'"
      class="q-mt-md full-width"
      no-caps
      :loading="pushLoading"
      @click="togglePush"
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
import { registerPushSubscription, unregisterPushSubscription } from 'src/services/api'

const $q = useQuasar()
const store = useSettingsStore()
const mode = ref('normal')
const pushSupported = ref(false)
const pushEnabled = ref(false)
const pushLoading = ref(false)

const options = [
  { label: 'Тихий режим', value: 'quiet' },
  { label: 'Обычные', value: 'normal' },
  { label: 'Только платежи', value: 'payments_only' }
]

onMounted(async () => {
  if (!store.data) {
    await store.load()
  }
  mode.value = store.data?.notification_mode ?? 'normal'
  pushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
})

watch(
  () => store.data?.notification_mode,
  (value) => {
    if (value) mode.value = value
  }
)

async function save () {
  try {
    await store.save({ notification_mode: mode.value })
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

async function togglePush () {
  if (!pushSupported.value) return
  pushLoading.value = true
  try {
    if (pushEnabled.value) {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await unregisterPushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      pushEnabled.value = false
      $q.notify({ type: 'positive', message: 'Push отключён', position: 'top' })
    } else {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Разрешение на уведомления не получено')
      }
      const reg = await navigator.serviceWorker.ready
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey || undefined
      })
      const json = sub.toJSON()
      await registerPushSubscription({
        endpoint: json.endpoint,
        keys: json.keys
      })
      pushEnabled.value = true
      $q.notify({ type: 'positive', message: 'Push включён', position: 'top' })
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  } finally {
    pushLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.notification-settings__hint {
  margin: var(--k-space-1) 0 0;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--k-text-secondary);
}
</style>
