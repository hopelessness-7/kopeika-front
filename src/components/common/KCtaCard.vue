<template>
  <div
    class="k-cta"
    :class="variant === 'warm' ? 'k-cta--warm' : 'k-cta--primary'"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keyup.enter="$emit('click')"
  >
    <div class="k-cta__icon">
      <q-icon :name="icon" size="22px" />
    </div>
    <div class="k-cta__title">{{ title }}</div>
    <span v-if="actionLabel" class="k-cta__action">{{ actionLabel }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  actionLabel: { type: String, default: '' },
  variant: { type: String, default: 'primary' }
})

defineEmits(['click'])
</script>
