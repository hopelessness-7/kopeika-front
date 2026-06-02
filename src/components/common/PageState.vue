<template>
  <div
    class="page-state"
    :class="{ 'page-state--overlay': loading || error || empty }"
  >
    <q-spinner v-if="loading" color="primary" size="40px" />
    <template v-else-if="error">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-body1 text-center q-mb-md">{{ error }}</div>
      <q-btn v-if="retry" outline color="primary" label="Повторить" no-caps @click="retry" />
    </template>
    <template v-else-if="empty">
      <q-icon :name="emptyIcon" size="48px" color="grey-5" class="q-mb-md" />
      <div class="text-body1 text-grey-7 text-center">{{ emptyText }}</div>
    </template>
    <slot v-else />
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  error: String,
  empty: Boolean,
  emptyText: { type: String, default: 'Пока ничего нет' },
  emptyIcon: { type: String, default: 'inbox' },
  retry: Function
})
</script>

<style scoped>
.page-state {
  width: 100%;
}

.page-state--overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: var(--k-space-6, 24px) 0;
}
</style>
