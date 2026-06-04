<template>
  <q-page>
    <AuthCard
      :title="done ? 'Готово' : 'Новый пароль'"
      :subtitle="
        done ? successMessage : 'Задайте новый пароль для входа в аккаунт'
      "
      :error="auth.error"
      footer-text="Вернуться к"
      footer-link-label="входу"
      footer-link-to="/login"
    >
      <template v-if="done">
        <q-btn
          label="Войти"
          color="primary"
          unelevated
          no-caps
          class="full-width"
          to="/login"
        />
      </template>
      <q-form v-else class="k-stack" @submit.prevent="onSubmit">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          dense
          readonly
          :error="!!auth.fieldError('email')"
          :error-message="auth.fieldError('email')"
        />
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Новый пароль"
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
          label="Сохранить пароль"
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthCard from 'src/components/auth/AuthCard.vue'
import { useAuthStore } from 'src/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const done = ref(false)
const successMessage = ref('')

onMounted(() => {
  token.value = typeof route.query.token === 'string' ? route.query.token : ''
  email.value = typeof route.query.email === 'string' ? route.query.email : ''
  if (!token.value || !email.value) {
    router.replace('/forgot-password')
  }
})

async function onSubmit () {
  auth.clearErrors()
  const message = await auth.completePasswordReset({
    token: token.value,
    email: email.value.trim(),
    password: password.value,
    password_confirmation: passwordConfirmation.value
  })
  if (message) {
    successMessage.value = message
    done.value = true
  }
}
</script>
