<template>
  <aside class="k-sidebar" aria-label="Навигация">
    <div class="k-sidebar__brand">
      <div class="k-sidebar__logo">K</div>
      <span class="k-sidebar__name">Kopeika</span>
    </div>

    <nav class="k-sidebar__nav">
      <router-link
        v-for="item in items"
        :key="item.name"
        :to="item.to"
        class="k-sidebar__link"
        :class="{ 'k-sidebar__link--active': isActive(item) }"
      >
        <q-icon :name="item.icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { name: 'home', to: '/', icon: 'home', label: 'Главная' },
  { name: 'obligations', to: '/obligations', icon: 'account_balance_wallet', label: 'Долги' },
  { name: 'calendar', to: '/calendar', icon: 'calendar_month', label: 'Календарь' },
  { name: 'import', to: '/import', icon: 'upload_file', label: 'Сверка' },
  { name: 'settings', to: '/settings', icon: 'tune', label: 'Настройки' }
]

function isActive (item) {
  if (item.name === 'home') return route.path === '/'
  if (item.name === 'obligations') return route.path.startsWith('/obligations')
  if (item.name === 'import') return route.path.startsWith('/import')
  return route.path.startsWith(item.to)
}
</script>
