<template>
  <div class="min-h-screen xl:flex" style="overflow: hidden">
    <app-sidebar />
    <Backdrop />
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']"
    >
      <app-header />
      <div
        class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6"
        style="overflow: hidden; height: 850px"
      >
        <slot></slot>
      </div>
      <!-- <div class="w-full h-[860px]">
        <img
          class="w-full h-full"
          style="object-fit: cover; background-position: center; background-repeat: no-repeat"
          src="../../../public/images/mainImage02.png"
          alt=""
        />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'
const { isExpanded, isHovered } = useSidebar()
</script>
