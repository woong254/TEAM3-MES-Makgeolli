<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'

/** 부모에서 v-model 로 열고닫기만 제어 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'close'])
const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const modalPur = ref([])
const searchName = ref('')

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

/** 날짜 포맷 통일 */
const formatPurData = (data) => {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    ...item,
    pur_date: item.pur_date ? userDateUtils.dateFormat(item.pur_date, 'yyyy-MM-dd') : item.pur_date,
    receipt_date: item.receipt_date
      ? userDateUtils.dateFormat(item.receipt_date, 'yyyy-MM-dd')
      : item.receipt_date,
  }))
}

const displayed = computed(() => modalPur.value)

/** 전체 목록 조회 */
const getPurList = async () => {
  try {
    const { data } = await axios.get('/api/purList')
    modalPur.value = formatPurData(data)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

/** 검색 */
const searchPur = async () => {
  const q = (searchName.value || '').trim()
  try {
    if (q) {
      const { data } = await axios.get('/api/purTarget', { params: { pur_name: q } })
      if (!data || data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getPurList()
        return
      }
      modalPur.value = formatPurData(data)
    } else {
      await getPurList()
    }
  } catch (error) {
    console.error('Error searching data:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

/** 모달이 열릴 때 목록 로딩, 닫히면 검색어 초기화 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) getPurList()
    else searchName.value = ''
  },
)
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
      <button type="button" class="btn-white btn-common" @click="searchPur">조회</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">발주서명</label>
          <input
            type="text"
            v-model="searchName"
            :class="baseInputClass"
            style="width: 200px"
            @keyup.enter="searchPur"
          />
        </div>
      </div>

      <div class="modal-container flex gap-2 mb-2">
        <DataTable
          :value="displayed"
          show-gridlines
          dataKey="pur_code"
          style="width: 1200px"
          paginator
          :rows="8"
        >
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
            header="매입처명"
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
