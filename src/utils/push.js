/**
 * Convert a URL-safe base64 VAPID public key to Uint8Array
 * for PushManager.subscribe({ applicationServerKey }).
 */
export function urlBase64ToUint8Array (base64String) {
  if (typeof base64String !== 'string' || !base64String.trim()) {
    throw new Error('Некорректный VAPID-ключ')
  }

  const trimmed = base64String.trim()
  const padding = '='.repeat((4 - (trimmed.length % 4)) % 4)
  const base64 = (trimmed + padding).replace(/-/g, '+').replace(/_/g, '/')

  let rawData
  try {
    rawData = window.atob(base64)
  } catch {
    throw new Error('Некорректный VAPID-ключ: неверный base64')
  }

  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  // Uncompressed P-256 public key is 65 bytes (0x04 || X || Y).
  if (outputArray.length !== 65) {
    throw new Error('Некорректный VAPID-ключ: ожидается 65 байт')
  }

  return outputArray
}

export function getVapidPublicKey () {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

export function isWebPushSupported () {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

const DEFAULT_SW_READY_TIMEOUT_MS = 10000

/**
 * `navigator.serviceWorker.ready` never rejects and waits forever if no SW
 * is registered/activated — that left the push button spinner stuck.
 */
export async function waitForActiveServiceWorker (
  timeoutMs = DEFAULT_SW_READY_TIMEOUT_MS
) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker не поддерживается в этом браузере')
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (registration?.active) {
    return registration
  }

  let timerId
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(
            new Error(
              'Service Worker не активен. Запустите `quasar dev -m pwa`, откройте сайт через localhost (не LAN IP) и сделайте hard refresh (Application → Service Workers).'
            )
          )
        }, timeoutMs)
      })
    ])
  } finally {
    if (timerId) clearTimeout(timerId)
  }
}
