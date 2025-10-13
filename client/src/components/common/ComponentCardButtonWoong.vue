<!-- 오른쪽 버튼 들어가는 컴포넌트 카드형식 -->

<template>
  <div
    :class="[
      'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
      className,
    ]"
  >
    <!-- Card Body -->
    <div class="p-4 border-t border-gray-100 dark:border-gray-800">
      <div class="space-y-5">
        <slot name="body-content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  className?: string
  desc?: string
}

defineProps<Props>()
</script>
