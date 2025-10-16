<!-- 자재입고검사 채점기준 모달창 -->
<script setup lang="ts">
import { computed } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'

// TS 선언
type ScoreDesc = {
  score: number
  desc: string
}
// 1. 모달 제어
const props = defineProps<{
  visible: boolean
  items?: string | ScoreDesc[] | null
}>()
const emit = defineEmits(['close', 'checked'])
const closeModal = () => {
  emit('close')
}

// 문자열이면 파싱, 배열이면 그대로
const list = computed<ScoreDesc[]>(() => {
  if (!props.items) return []
  if (Array.isArray(props.items)) return props.items
  try {
    const parsed = JSON.parse(props.items)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="채점기준"
      :fullScreenBackdrop="true"
      title-align="left"
      header-align="right"
      width="450px"
      @close="closeModal"
    >
      <template #modal-body>
        <div class="modal-container" style="height: 300px; overflow-y: scroll">
          <ul v-if="list.length" class="space-y-2">
            <li v-for="it in list" :key="it.score" class="flex gap-3 items-start">
              <span
                class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-semibold"
              >
                {{ it.score }}
              </span>
              <span class="text-sm leading-relaxed text-gray-700">
                {{ it.desc }}
              </span>
            </li>
          </ul>
          <div v-else class="text-sm text-gray-400">등록된 채점기준이 없습니다.</div>
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
