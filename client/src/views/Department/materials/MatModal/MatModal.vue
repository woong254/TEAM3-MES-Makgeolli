<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { watch, ref } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['close'])
const selectModalMat = ref([])
const close = () => emit('close')

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

watch(
  () => props.modelValue, // 모달 열림/닫힘 감지
  (val) => {
    if (!val) selectModalMat.value = [] // 모달 닫힐 때 체크 초기화
  },
)

const modalMat = ref([
  {
    mat_code: 'MAT-001',
    mat_name: '쌀',
    stock_qty: 500,
    safe_stock: 200,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
  {
    mat_code: 'MAT-002',
    mat_name: '밀가루',
    stock_qty: 300,
    safe_stock: 100,
    MAT_SPEC: '20kg',
    MAT_UNIT: '포대',
  },
])
</script>
<template>
  <Modal
    v-if="props.modelValue"
    @close="close"
    title="발주자재 조회"
    title-align="left"
    header-align="right"
    width="800px"
  >
    <template #modal-header>
      <button type="button" class="btn-white btn-common">조회</button>
      <button type="button" class="btn-color btn-common">등록</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">자재명</label>
          <input type="text" :class="baseInputClass" style="width: 200px" />
        </div>
      </div>

      <div class="modal-container flex gap-2 mb-2">
        <DataTable
          :value="modalMat"
          show-gridlines
          v-model:selection="selectModalMat"
          datakey="mat_code"
          style="width: 1200px"
        >
          <DataCol selectionMode="multiple" headerStyle="width: 37px" bodyStyle="width: 37px" />
          <DataCol
            field="mat_code"
            header="자재코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="mat_name"
            header="자재명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="stock_qty"
            header="재고"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="safe_stock"
            header="안전재고"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol field="MAT_SPEC" header="규격" :pt="{ columnHeaderContent: 'justify-center' }" />
          <DataCol field="MAT_UNIT" header="단위" :pt="{ columnHeaderContent: 'justify-center' }" />
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
