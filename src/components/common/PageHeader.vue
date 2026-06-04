<template>
  <header class="k-page-head">
    <div class="k-page-head__row">
      <q-btn
        v-if="back"
        flat
        round
        dense
        icon="arrow_back"
        class="k-page-head__back"
        aria-label="Назад"
        @click="onBack"
      />
      <div class="k-page-head__text">
        <h1 class="k-page-head__title">{{ title }}</h1>
        <p v-if="subtitle" class="k-page-head__sub">{{ subtitle }}</p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  back: { type: Boolean, default: false },
  backTo: { type: String, default: '' }
})

const router = useRouter()

function onBack () {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>
