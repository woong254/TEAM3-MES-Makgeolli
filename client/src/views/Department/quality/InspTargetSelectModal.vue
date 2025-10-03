<script setup lang="ts">
import { ref } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'

// 1. 부모로부터 'visible' prop을 받습니다.
const props = defineProps<{
  visible: boolean
}>()

// 2. 부모에게 알릴 'close' 이벤트를 정의합니다.
const emit = defineEmits(['close'])

// 모달 내부에서 닫기 동작 시 호출될 함수
const closeModal = () => {
  emit('close') // 'close' 이벤트를 부모에게 발생시켜 닫아달라고 요청합니다.
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

// table data
const inspData = ref([
  {
    inspCode: 'QC0001',
    inspName: '쌀 외관검사',
    inspTarget: '쌀20kg(원재료)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0002',
    inspName: '알코올 도수 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: 'QC0003',
    inspName: '대장균 검사',
    inspTarget: '막걸리(반제품)',
    inspUsing: 'Y',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
  {
    inspCode: '-',
    inspName: '-',
    inspTarget: '-',
    inspUsing: '-',
  },
])
</script>

<template>
  <div v-if="props.visible">
    <Modal title="검사대상" :fullScreenBackdrop="true" title-align="left" header-align="right">
      <template #modal-header>
        <div class="flex justify-end">
          <button type="button" class="btn-common-modal btn-white">초기화</button>
          <button type="button" class="btn-common-modal btn-color">조회</button>
        </div>
      </template>
      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div class="w-1/3">
            <label :class="labelStyle" for="insp-name"> 자재/제품명 </label>
            <input type="text" id="insp-name" :class="inputStyle" />
          </div>
          <div class="w-1/3">
            <label :class="labelStyle" for="insp-type"> 품목구분 </label>
            <div class="relative z-20 bg-transparent">
              <select id="insp-type" :class="selectStyle">
                <option value="">원자재</option>
                <option value="marketing">부자재</option>
                <option value="template">재공품</option>
                <option value="development">반제품</option>
                <option value="development">완제품</option>
              </select>
              <span
                class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400"
              >
                <svg
                  class="stroke-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                    stroke=""
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-container">
          <DataTable
            :value="inspData"
            showGridlines
            scrollable
            size="small"
            class="text-sm z-[100001]"
            paginator
            :rows="8"
          >
            <DataCol
              field="inspCheck"
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="multiple"
              style="width: 10px"
            />
            <DataCol
              field="inspCode"
              header="검사항목ID"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            />
            <DataCol
              field="inspName"
              header="자재/제품ID"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspTarget"
              header="자재/제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="구분"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="품목구분"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="inspUsing"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
          </DataTable>
        </div>
        <div class="flex justify-center mt-3">
          <button class="btn-common btn-white" @click="closeModal">확인</button>
          <button class="btn-common btn-color" @click="closeModal">취소</button>
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
