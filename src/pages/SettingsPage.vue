<template>
  <q-page class="k-page k-page--wide">
    <PageHeader title="Настройки" subtitle="Оформление и аккаунт" />

    <div class="k-page-body">
      <div class="k-panel k-settings-grid">
        <AuthAccountSection />
        <ThemeSection />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import PageHeader from 'src/components/common/PageHeader.vue'
import ThemeSection from 'src/components/settings/ThemeSection.vue'
import AuthAccountSection from 'src/components/settings/AuthAccountSection.vue'
</script>
