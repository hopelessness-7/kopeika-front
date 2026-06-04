<template>
  <section class="k-panel__section">
    <p class="k-panel__label">Аккаунт</p>
    <p v-if="auth.user" class="auth-account__email">{{ auth.user.email }}</p>
    <p v-else class="auth-account__email text-grey-7">Не выполнен вход</p>
    <div class="auth-account__actions">
      <q-btn
        v-if="auth.user"
        outline
        no-caps
        color="negative"
        label="Выйти"
        :loading="auth.loading"
        @click="onLogout"
      />
      <q-btn
        v-else
        unelevated
        no-caps
        color="primary"
        label="Войти"
        to="/login"
      />
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()

async function onLogout () {
  await auth.signOut()
  $q.notify({ type: 'info', message: 'Вы вышли из аккаунта', position: 'top' })
  await router.push('/login')
}
</script>

<style scoped>
.auth-account__email {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 var(--k-space-3);
}

.auth-account__actions {
  display: flex;
  gap: var(--k-space-2);
}
</style>
