<template>
  <q-layout
    view="hHh lpR fFf"
    class="k-layout"
    :class="{ 'k-layout--desktop': isDesktop && showTabs }"
  >
    <AppSidebar v-if="isDesktop && showTabs" />

    <q-header v-if="showHeader" class="k-app-header">
      <q-toolbar>
        <q-btn
          v-if="showBack"
          flat
          round
          dense
          icon="arrow_back"
          aria-label="Назад"
          @click="$router.back()"
        />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container class="k-layout__content">
      <router-view />
    </q-page-container>

    <q-footer v-if="showTabs && !isDesktop" class="k-footer">
      <AppBottomNav />
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AppBottomNav from 'src/components/common/AppBottomNav.vue'
import AppSidebar from 'src/components/common/AppSidebar.vue'

const route = useRoute()
const $q = useQuasar()

const isDesktop = computed(() => $q.screen.width >= 1024)

const titles = {
  '/obligations': 'Обязательства',
  '/obligations/new': 'Новое обязательство',
  '/incomes': 'Доходы',
  '/savings': 'Накопления',
  '/reconciliation': 'Сверка',
  '/calendar': 'Календарь',
  '/settings': 'Настройки',
  '/check-in': 'Быстрая сверка'
}

const showTabs = computed(() => {
  const hidden = ['/check-in', '/obligations/new']
  if (hidden.includes(route.path)) return false
  if (route.path.match(/^\/obligations\/\d+\/edit$/)) return false
  if (route.path.match(/^\/reconciliation\/\d+$/)) return false
  return true
})

const showBack = computed(() => !showTabs.value)

const showHeader = computed(() => {
  const p = route.path
  const noHeader = [
    '/',
    '/obligations',
    '/incomes',
    '/savings',
    '/reconciliation',
    '/calendar',
    '/settings',
    '/check-in',
    '/obligations/new'
  ]
  if (noHeader.includes(p)) return false
  if (/^\/obligations\/\d+\/edit$/.test(p)) return false
  if (/^\/reconciliation\/\d+$/.test(p)) return false
  return true
})

const pageTitle = computed(() => {
  if (route.path.match(/^\/obligations\/\d+\/edit$/)) return 'Редактирование'
  if (route.path.match(/^\/reconciliation\/\d+$/)) return 'Выписка'
  return titles[route.path] || 'Kopeika'
})
</script>

<style scoped>
.k-footer {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
