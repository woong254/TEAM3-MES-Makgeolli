<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { defineProps } from 'vue'

interface Props {
  title: string
  className?: string
  desc?: string
}

defineProps<Props>()
</script>
<template>
  <div
    :class="[
      'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
    ]"
  >
    <!-- Card Header -->
    <div class="px-2 pt-2 pb-1 m-1">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
          {{ title }}
        </h3>
        <div class="flex items-center gap-2">
          <Button size="sm" variant="primary"> 초기화 </Button>
          <Button size="sm" variant="primary"> 조회 </Button>
        </div>
      </div>
      <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ desc }}
      </p>
    </div>
    <!-- Card Body -->
    <form action="">
      <div class="pt-2 px-4 pb-3 border-t border-gray-100 dark:border-gray-800">
        <div
          class="rounded-2xl dark:border-gray-800 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 py-2"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              주문서명
            </label>
            <input
              type="text"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm dark:bg-gray-900 dark:border-gray-700"
              placeholder=""
            />
            <div class="mt-3">
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                납기일자
              </label>
              <div class="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="date" class="h-9 rounded border px-2" style="width: 150px" />
                <span class="mx-2">~</span>
                <input type="date" class="h-9 rounded border px-2" style="width: 150px" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              거래처명
            </label>
            <input
              type="text"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm dark:bg-gray-900 dark:border-gray-700"
              placeholder=""
            />
            <div class="mt-3">
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                주문일자
              </label>
              <div class="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="date" class="h-9 rounded border px-2" style="width: 150px" />
                <span class="mx-2">~</span>
                <input type="date" class="h-9 rounded border px-2" style="width: 150px" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              대표자
            </label>
            <input
              type="text"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm dark:bg-gray-900 dark:border-gray-700"
              placeholder=""
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              주문서작성담당자
            </label>
            <input
              type="text"
              class="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm dark:bg-gray-900 dark:border-gray-700"
              placeholder=""
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style>
/* 네이티브 캘린더 아이콘 보이게 */
input[type='date'] {
  -webkit-appearance: auto;
  appearance: auto;
}

/* 크로미엄에서 캘린더 인디케이터 표시 */
input[type='date']::-webkit-calendar-picker-indicator {
  display: block;
  opacity: 1;
}
</style>
