<template>
  <q-page>
    <AuthCard
      title="Вход"
      subtitle="Войдите в аккаунт, чтобы видеть свои данные"
      :error="auth.error"
      footer-text="Нет аккаунта?"
      footer-link-label="Зарегистрироваться"
      footer-link-to="/register"
    >
      <q-form class="k-stack" @submit.prevent="onSubmit">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          autocomplete="email"
          outlined
          dense
          :error="!!auth.fieldError('email')"
          :error-message="auth.fieldError('email')"
        />
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Пароль"
          autocomplete="current-password"
          outlined
          dense
          :error="!!auth.fieldError('password')"
          :error-message="auth.fieldError('password')"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <q-checkbox v-model="remember" label="Запомнить меня" dense />
        <q-btn
          type="submit"
          label="Войти"
          color="primary"
          unelevated
          no-caps
          class="full-width"
          :loading="auth.loading"
        />
        <p class="text-center q-mb-none">
          <router-link to="/forgot-password" class="k-auth-card__link">
            Забыли пароль?
          </router-link>
        </p>
        <p v-if="showDemoHint" class="auth-demo-hint q-mb-none">
          Демо: demo@kopeika.local / password
        </p>
      </q-form>
    </AuthCard>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthCard from 'src/components/auth/AuthCard.vue'
import { useAuthStore } from 'src/stores/auth'
import { useMocks } from 'src/services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const showDemoHint = computed(
  () => process.env.DEV === true && !useMocks
)

async function onSubmit () {
  auth.clearErrors()
  const ok = await auth.signIn({
    email: email.value.trim(),
    password: password.value,
    remember: remember.value
  })
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  }
}
</script>

<style scoped>
.auth-demo-hint {
  font-size: 0.75rem;
  color: var(--k-text-muted);
  text-align: center;
  margin-top: var(--k-space-2);
}
</style>
