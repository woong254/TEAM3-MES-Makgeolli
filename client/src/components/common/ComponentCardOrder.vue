<!-- 오른쪽 버튼 들어가는 컴포넌트 카드형식 -->

<template>
  <div
    :class="[
      'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
      className,
    ]"
  >
    <!-- Card Header -->
    <div class="px-4 py-1 flex justify-between items-center">
      <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
        {{ title }}
      </h3>
      <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ desc }}
      </p>

      <!-- button -->
      <slot name="header-right"></slot>
    </div>

    <!-- Card Body -->
    <div class="p-1 border-t border-gray-100 dark:border-gray-800 sm:p-">
      <div class="space-y-5">
        <slot name="body-content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  title: string
  className?: string
  desc?: string
}

defineProps<Props>()
</script>
