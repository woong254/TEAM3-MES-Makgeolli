<template>
  <div class="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center">
    <!-- max-h-screen과 overflow-y-auto는 모달 박스 감싸는 wrapper로 이동 -->
    <div class="max-h-screen overflow-y-auto p-6">
      <!-- backdrop -->
      <!-- fullScreenBackdrop 사용시 뒤에 블러처리
           사용법 <Modal :fullScreenBackdrop="true"></Modal>로 처리 -->
      <div
        v-if="fullScreenBackdrop"
        class="fixed inset-0 h-full w-full bg-gray-500/50"
        aria-hidden="true"
      ></div>

      <!-- modal box -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md relative"
        :style="{ width: props.width || '600px', maxWidth: 'none' }"
      >
        <!-- 닫기 버튼 (우측 상단) -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-black text-lg hover:text-red-500 mr-2"
        >
          ✕
        </button>

        <!-- 제목 -->
        <div
          class="mb-4"
          :class="{
            'text-left': props.titleAlign === 'left',
            'text-center': !props.titleAlign || props.titleAlign === 'center',
            'text-right': props.titleAlign === 'right',
          }"
        >
          <h2 class="text-lg font-bold text-black">{{ props.title }}</h2>
        </div>

        <!-- 헤더 -->
        <div
          v-if="slots['modal-header']"
          class="flex mb-4"
          :class="{
            'justify-start': props.headerAlign === 'left',
            'justify-center': !props.headerAlign || props.headerAlign === 'center',
            'justify-end': props.headerAlign === 'right',
          }"
        >
          <slot name="modal-header"></slot>
        </div>

        <!-- 바디 -->
        <div class="mt-4">
          <slot name="modal-body"></slot>
        </div>

        <!-- 푸터 -->
        <div
          v-if="slots['modal-footer']"
          class="mt-6 flex"
          :class="{
            'justify-start': props.footerAlign === 'left',
            'justify-center': !props.footerAlign || props.footerAlign === 'center',
            'justify-end': props.footerAlign === 'right',
          }"
        >
          <slot name="modal-footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

// 슬롯 참조
const slots = useSlots()

// props 타입 선언
interface ModalProps {
  fullScreenBackdrop?: boolean
  title: string
  titleAlign?: 'left' | 'center' | 'right' // 타이틀 정렬 옵션 추가
  headerAlign?: 'left' | 'center' | 'right' // 헤더 정렬 옵션
  footerAlign?: 'left' | 'center' | 'right' // 푸터 정렬 옵션
  width?: string
}

// props 정의
const props = defineProps<ModalProps>()

// close 이벤트 정의
defineEmits(['close'])
</script>
