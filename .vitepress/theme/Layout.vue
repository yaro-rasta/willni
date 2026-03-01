<script setup>
import DefaultTheme from 'vitepress/theme'
import BackgroundScene from './components/BackgroundScene.vue'
import ChatWidget from './components/ChatWidget.vue'
import { onMounted } from 'vue'

const { Layout: BaseLayout } = DefaultTheme

onMounted(() => {
  const logo = document.querySelector('.VPNavBarTitle')
  if (logo) {
    logo.addEventListener('click', () => {
      if (window.triggerShipSpeed) {
        window.triggerShipSpeed()
      }
    })
  }
})
</script>

<template>
  <BaseLayout>
    <template #layout-top>
      <BackgroundScene />
    </template>
    <template #layout-bottom>
      <ChatWidget />
    </template>
  </BaseLayout>
</template>

<style>
.VPContent {
  background: transparent !important;
}
.VPHome {
  background: transparent !important;
}
</style>
