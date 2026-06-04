<template>
  <q-page>
    <AuthCard
      title="Регистрация"
      subtitle="Создайте аккаунт — настройки и данные будут только ваши"
      :error="auth.error"
      footer-text="Уже есть аккаунт?"
      footer-link-label="Войти"
      footer-link-to="/login"
    >
      <q-form class="k-stack" @submit.prevent="onSubmit">
        <q-input
          v-model="name"
          label="Имя"
          autocomplete="name"
          outlined
          dense
          :error="!!auth.fieldError('name')"
          :error-message="auth.fieldError('name')"
        />
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
          autocomplete="new-password"
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
        <q-input
          v-model="passwordConfirmation"
          :type="showPassword ? 'text' : 'password'"
          label="Повторите пароль"
          autocomplete="new-password"
          outlined
          dense
        />
        <q-btn
          type="submit"
          label="Создать аккаунт"
          color="primary"
          unelevated
          no-caps
          class="full-width"
          :loading="auth.loading"
        />
      </q-form>
    </AuthCard>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from 'src/components/auth/AuthCard.vue'
import { useAuthStore } from 'src/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)

async function onSubmit () {
  auth.clearErrors()
  const ok = await auth.signUp({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
    password_confirmation: passwordConfirmation.value
  })
  if (ok) {
    await router.replace('/')
  }
}
</script>
