<template>
  <AdminLayout>
    <div class="container-box">
      <form action="" class="flex flex-nowrap h-50">
        <button
          type="button"
          class="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition"
        ></button>
        <label class="m-auto block text-sm font-medium text-gray-700 dark:text-gray-400">
          설비코드
        </label>
        <input
          type="text"
          class="dark:bg-dark-900 h-10 w-70 m-auto rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <label class="m-auto block text-sm font-medium text-gray-700 dark:text-gray-400">
          설비명
        </label>
        <input
          type="text"
          class="dark:bg-dark-900 h-11 w-70 m-auto rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <label class="m-auto block text-sm font-medium text-gray-700 dark:text-gray-400">
          설비유형
        </label>
        <input
          type="text"
          class="dark:bg-dark-900 h-11 w-70 m-auto rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>

<style scoped>
.container-box {
  background: white;
}
</style>
