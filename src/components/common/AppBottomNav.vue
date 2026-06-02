<template>
  <nav class="k-bottom-nav" aria-label="Основная навигация">
    <router-link
      v-for="item in items"
      :key="item.name"
      :to="item.to"
      class="k-bottom-nav__item"
      :class="{ 'k-bottom-nav__item--active': isActive(item) }"
    >
      <q-icon :name="item.icon" />
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { name: 'home', to: '/', icon: 'home', label: 'Главная' },
  { name: 'obligations', to: '/obligations', icon: 'account_balance_wallet', label: 'Долги' },
  { name: 'calendar', to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { name: 'import', to: '/import', icon: 'upload_file', label: 'Сверка' },
  { name: 'settings', to: '/settings', icon: 'tune', label: 'Ещё' }
]

function isActive (item) {
  if (item.name === 'home') return route.path === '/'
  if (item.name === 'obligations') return route.path.startsWith('/obligations')
  if (item.name === 'import') return route.path.startsWith('/import')
  return route.path.startsWith(item.to)
}
</script>
