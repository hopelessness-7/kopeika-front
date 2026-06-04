<template>
  <div class="k-auth">
    <div class="k-auth__inner">
      <div class="k-auth__brand">
        <p class="k-auth__logo">Kopeika</p>
        <p v-if="tagline" class="k-auth__tagline">{{ tagline }}</p>
      </div>

      <div class="k-auth-card">
        <h1 class="k-auth-card__title">{{ title }}</h1>
        <p v-if="subtitle" class="k-auth-card__sub">{{ subtitle }}</p>

        <q-banner
          v-if="error"
          dense
          rounded
          class="k-auth-banner bg-negative text-white"
        >
          {{ error }}
        </q-banner>

        <slot />

        <p v-if="footerText" class="k-auth-card__footer">
          {{ footerText }}
          <router-link v-if="footerLinkTo" :to="footerLinkTo" class="k-auth-card__link">
            {{ footerLinkLabel }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  tagline: { type: String, default: 'Личные финансы без сюрпризов' },
  error: { type: String, default: '' },
  footerText: { type: String, default: '' },
  footerLinkLabel: { type: String, default: '' },
  footerLinkTo: { type: String, default: '' }
})
</script>
