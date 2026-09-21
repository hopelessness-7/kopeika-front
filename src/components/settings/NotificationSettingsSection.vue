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

    <div class="notification-settings__push q-mt-md">
      <p
        v-if="pushStatusHint"
        class="notification-settings__status"
        :class="{ 'notification-settings__status--warn': pushBlocked }"
      >
        {{ pushStatusHint }}
      </p>
      <q-btn
        v-if="showPushButton"
        outline
        color="primary"
        :label="pushEnabled ? 'Отключить push' : 'Включить push'"
        class="full-width"
        no-caps
        :loading="pushLoading"
        :disable="pushBlocked && !pushEnabled"
        @click="togglePush"
      />
    </div>

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
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'src/stores/settings'
import { registerPushSubscription, unregisterPushSubscription } from 'src/services/api'
import {
  getVapidPublicKey,
  isWebPushSupported,
  urlBase64ToUint8Array,
  waitForActiveServiceWorker
} from 'src/utils/push'

const $q = useQuasar()
const store = useSettingsStore()
const mode = ref('normal')
const pushSupported = ref(false)
const pushEnabled = ref(false)
const pushLoading = ref(false)
const permission = ref(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
)
const vapidKey = getVapidPublicKey()

const options = [
  { label: 'Тихий режим', value: 'quiet' },
  { label: 'Обычные', value: 'normal' },
  { label: 'Только платежи', value: 'payments_only' }
]

const pushBlocked = computed(() => {
  if (!pushSupported.value) return true
  if (!vapidKey) return true
  if (permission.value === 'denied') return true
  return false
})

const showPushButton = computed(() => pushSupported.value)

const pushStatusHint = computed(() => {
  if (!pushSupported.value) {
    return 'Этот браузер не поддерживает Web Push (нужны Service Worker и PushManager).'
  }
  if (!vapidKey) {
    return 'Не задан VITE_VAPID_PUBLIC_KEY — push недоступен. Добавьте публичный VAPID-ключ в .env и перезапустите dev-сервер.'
  }
  if (permission.value === 'denied') {
    return 'Уведомления запрещены в настройках браузера. Разрешите их для этого сайта, чтобы включить push.'
  }
  if (pushEnabled.value) {
    return 'Push включён для этого устройства.'
  }
  return 'После включения браузер запросит разрешение на уведомления.'
})

onMounted(async () => {
  if (!store.data) {
    await store.load()
  }
  mode.value = store.data?.notification_mode ?? 'normal'
  pushSupported.value = isWebPushSupported()
  if (!pushSupported.value) return

  permission.value = Notification.permission
  await refreshSubscriptionState()
})

watch(
  () => store.data?.notification_mode,
  (value) => {
    if (value) mode.value = value
  }
)

async function refreshSubscriptionState () {
  try {
    const reg = await waitForActiveServiceWorker(5000)
    const sub = await reg.pushManager.getSubscription()
    pushEnabled.value = Boolean(sub)
  } catch {
    pushEnabled.value = false
  }
}

async function save () {
  try {
    await store.save({ notification_mode: mode.value })
    $q.notify({ type: 'positive', message: 'Сохранено', position: 'top' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

function pushErrorMessage (error) {
  const msg = error?.message || String(error || '')
  if (/permission|разрешен/i.test(msg) || permission.value === 'denied') {
    return 'Разрешение на уведомления не получено'
  }
  if (/VAPID|applicationServerKey|InvalidAccessError|not a valid|base64/i.test(msg)) {
    return 'Некорректный VAPID-ключ. Проверьте VITE_VAPID_PUBLIC_KEY и перезапустите dev-сервер.'
  }
  if (/service worker|не активен|registration/i.test(msg)) {
    return msg.includes('Service Worker')
      ? msg
      : 'Service Worker ещё не готов. Обновите страницу и попробуйте снова.'
  }
  if (error?.status === 419) {
    return 'Сессия устарела (CSRF). Обновите страницу и войдите снова.'
  }
  if (error?.code === 'ECONNABORTED' || /timeout/i.test(msg)) {
    return 'Сервер не ответил вовремя. Проверьте, что бэкенд запущен.'
  }
  return msg || 'Не удалось изменить push-подписку'
}

async function togglePush () {
  if (!pushSupported.value || pushLoading.value) return
  pushLoading.value = true
  try {
    // Resolve SW before permission / subscribe — `.ready` hangs forever without an active worker.
    const reg = await waitForActiveServiceWorker()

    if (pushEnabled.value) {
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        try {
          await unregisterPushSubscription(sub.endpoint)
        } catch (apiError) {
          // Local unsubscribe still useful if API fails after logout/etc.
          console.warn('unregisterPushSubscription failed', apiError)
        }
        await sub.unsubscribe()
      }
      pushEnabled.value = false
      $q.notify({ type: 'positive', message: 'Push отключён', position: 'top' })
      return
    }

    if (!vapidKey) {
      throw new Error('Не задан VITE_VAPID_PUBLIC_KEY')
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidKey)

    const nextPermission = await Notification.requestPermission()
    permission.value = nextPermission
    if (nextPermission !== 'granted') {
      throw new Error('Разрешение на уведомления не получено')
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })
    const json = sub.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      throw new Error('Браузер вернул неполную push-подписку')
    }

    await registerPushSubscription({
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth
      }
    })
    pushEnabled.value = true
    $q.notify({ type: 'positive', message: 'Push включён', position: 'top' })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: pushErrorMessage(e),
      position: 'top'
    })
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

.notification-settings__status {
  margin: 0 0 var(--k-space-2);
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--k-text-secondary);
}

.notification-settings__status--warn {
  color: var(--k-text-secondary);
  opacity: 0.95;
}
</style>
