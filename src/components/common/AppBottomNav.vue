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
  { name: 'incomes', to: '/incomes', icon: 'payments', label: 'Доходы' },
  { name: 'savings', to: '/savings', icon: 'savings', label: 'Накопления' },
  { name: 'reconciliation', to: '/reconciliation', icon: 'upload_file', label: 'Сверка' }
]

function isActive (item) {
  if (item.name === 'home') return route.path === '/'
  if (item.name === 'obligations') return route.path.startsWith('/obligations')
  if (item.name === 'reconciliation') return route.path.startsWith('/reconciliation')
  if (item.name === 'calendar') return route.path.startsWith('/calendar')
  return route.path.startsWith(item.to)
}
</script>
