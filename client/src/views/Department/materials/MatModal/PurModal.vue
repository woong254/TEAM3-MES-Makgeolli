<!-- src/views/Department/materials/MatModal/PurModal.vue -->
<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'close'])
const selectPur = ref(null)
const close = () => emit('close')

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

watch(
  () => props.modelValue,
  (val) => {
    if (!val) selectPur.value = null
  },
)

const modalPur = ref([
  {
    pur_code: 'BAL-001',
    pur_name: '20250930쌀발주',
    bcnc_name: '농협',
    pur_date: '2025-10-01',
    receipt_date: '2025-10-30',
    emp_name: '정지웅',
    remark: '쌀 많이 주세요~~',
  },
  {
    pur_code: 'BAL-002',
    pur_name: '202501003보리발주',
    bcnc_name: '삼성물산',
    pur_date: '2025-10-01',
    receipt_date: '2025-11-25',
    emp_name: '박봉근',
    remark: '보리 넉넉하게 주세요',
  },
])
</script>
<template>
  <Modal
    v-if="props.modelValue"
    @close="close"
    title="발주서 조회"
    title-align="left"
    header-align="right"
    width="1200px"
  >
    <template #modal-header>
      <button type="button" class="btn-white btn-common">조회</button>
      <button type="button" class="btn-color btn-common">등록</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">발주서명</label>
          <input type="text" :class="baseInputClass" style="width: 200px" />
        </div>
      </div>

      <div class="modal-container flex gap-2 mb-2">
        <DataTable
          :value="modalPur"
          show-gridlines
          v-model:selection="selectPur"
          datakey="pur_code"
          style="width: 1200px"
        >
          <DataCol selectionMode="single" headerStyle="width: 37px" bodyStyle="width: 37px" />
          <DataCol
            field="pur_code"
            header="발주코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="pur_name"
            header="발주서명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="bcnc_name"
            header="공급업체명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="pur_date"
            header="발주일자"
            style="text-align: center"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="receipt_date"
            header="입고요청일자"
            style="text-align: center"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="emp_name"
            header="담당자"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol field="remark" header="비고" :pt="{ columnHeaderContent: 'justify-center' }" />
        </DataTable>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
