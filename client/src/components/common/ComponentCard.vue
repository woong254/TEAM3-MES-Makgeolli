<template>
  <div
    :class="[
      'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
      className,
    ]"
  >
    <!-- Card Header -->
    <div class="px-2 pt-2 pb-1 m-1">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
          {{ title }}
        </h3>
        <slot name="header"></slot>
      </div>
      <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ desc }}
      </p>
      <slot name="cardHeader"></slot>
    </div>

    <!-- Card Body -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
      <div class="space-y-5">
        <slot name="body"></slot>
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
