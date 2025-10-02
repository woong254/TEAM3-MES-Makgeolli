<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999">
    <!-- fullScreenBackdrop 사용시 뒤에 블러처리 
     사용법 <Modal :fullScreenBackdrop="true"></Modal>로 처리 -->
    <div
      v-if="fullScreenBackdrop"
      class="fixed inset-0 h-full w-full bg-gray-500/50"
      aria-hidden="true"
    ></div>
    <!-- modal -->
    <div class="bg-white p-6 rounded-lg shadow-md z-[100000] max-w-3xl w-full relative">
      <!-- header -->
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
          {{ title }}
        </h3>
        <!-- button -->
        <slot name="modal-header"></slot>
      </div>
      <!-- body -->
      <slot name="modal-body"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ModalProps {
  fullScreenBackdrop?: boolean
  title: string
}

defineProps<ModalProps>()
defineEmits(['close'])
</script>
