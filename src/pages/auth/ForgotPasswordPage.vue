<template>
  <q-page>
    <AuthCard
      :title="sent ? 'Проверьте почту' : 'Сброс пароля'"
      :subtitle="
        sent
          ? 'Если email есть в системе, мы отправили ссылку для сброса.'
          : 'Укажите email — пришлём ссылку для нового пароля'
      "
      :error="auth.error"
      footer-text="Вспомнили пароль?"
      footer-link-label="Войти"
      footer-link-to="/login"
    >
      <template v-if="sent">
        <q-btn
          label="На страницу входа"
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
          autocomplete="email"
          outlined
          dense
          :error="!!auth.fieldError('email')"
          :error-message="auth.fieldError('email')"
        />
        <q-btn
          type="submit"
          label="Отправить ссылку"
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
import AuthCard from 'src/components/auth/AuthCard.vue'
import { useAuthStore } from 'src/stores/auth'

const auth = useAuthStore()
const email = ref('')
const sent = ref(false)

async function onSubmit () {
  auth.clearErrors()
  const message = await auth.requestPasswordReset(email.value.trim())
  if (message) {
    sent.value = true
  }
}
</script>
