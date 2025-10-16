<!-- 검사방법 누르면 나타나는 모달창 -->
<script setup lang="ts">
import { watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'

// 1. 모달 제어
const props = defineProps<{
  visible: boolean
  method?: string | null
}>()
const emit = defineEmits(['close', 'checked'])
const closeModal = () => {
  emit('close')
}

// 값 확인용(나중에 제거)
watch(
  () => props.method,
  (v) => console.log('모달 props.method 변경:', v),
  { immediate: true },
)
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="검사방법"
      :fullScreenBackdrop="true"
      title-align="left"
      header-align="right"
      width="450px"
      @close="closeModal"
    >
      <template #modal-body>
        <div class="modal-container" style="height: 300px; overflow-y: scroll">
          <div v-if="props.method && props.method !== '-'">
            <div class="text-sm whitespace-pre snap-y" style="line-height: 1.5">
              {{ props.method }}
            </div>
          </div>
          <div v-else class="text-gray-400">등록된 검사방법이 없습니다.</div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
