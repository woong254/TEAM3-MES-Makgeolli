<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import userDateUtils from '@/utils/useDates.js'

const props = defineProps({
  modelValue: Boolean,
  blockedCodes: { type: Array, default: () => [] },
  blockedNames: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'close', 'select'])
const close = () => emit('close')

const modalPur = ref([])
const searchName = ref('')
const selectModalPur = ref(null)

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const formatPurData = (data) => {
  if (!Array.isArray(data)) return data
  return data.map((item) => ({
    ...item,
    pur_date: item.pur_date ? userDateUtils.dateFormat(item.pur_date, 'yyyy-MM-dd') : item.pur_date,
    receipt_date: item.receipt_date
      ? userDateUtils.dateFormat(item.receipt_date, 'yyyy-MM-dd')
      : item.receipt_date,
  }))
}

const blockedCodeSet = computed(() => new Set(props.blockedCodes ?? []))
const blockedNameSet = computed(() => new Set(props.blockedNames ?? []))

const displayed = computed(() =>
  modalPur.value.filter(
    (r) => !blockedCodeSet.value.has(r?.pur_code) && !blockedNameSet.value.has(r?.pur_name),
  ),
)

watch([blockedCodeSet, blockedNameSet], () => {
  if (
    selectModalPur.value &&
    (blockedCodeSet.value.has(selectModalPur.value?.pur_code) ||
      blockedNameSet.value.has(selectModalPur.value?.pur_name))
  ) {
    selectModalPur.value = null
  }
})

const getPurList = async () => {
  try {
    const response = await axios.get('/api/purList')
    modalPur.value = formatPurData(response.data)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const searchPur = async () => {
  const q = searchName.value.trim()
  try {
    let response
    if (q) {
      response = await axios.get('/api/purTarget', { params: { pur_name: q } })
      if (!response.data || response.data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getPurList()
        return
      }
      modalPur.value = formatPurData(response.data)
    } else {
      response = await axios.get('/api/purList')
      modalPur.value = formatPurData(response.data)
    }
  } catch (error) {
    console.error('Error searching data:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) getPurList()
    else {
      selectModalPur.value = null
      searchName.value = ''
    }
  },
)

const selectPur = () => {
  if (selectModalPur.value) {
    emit('select', selectModalPur.value)
    emit('update:modelValue', false)
    emit('close')
  } else {
    alert('발주서를 선택해주세요.')
  }
}
</script>

<template>
  <Modal
    v-if="props.modelValue"
    @close="close"
    title="발주서 조회"
    title-align="left"
    header-align="right"
    footer-align="center"
    width="1200px"
  >
    <template #modal-header>
      <button type="button" class="btn-color btn-common" @click="searchPur">조회</button>
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
          v-model:selection="selectModalPur"
          dataKey="pur_code"
          style="width: 1200px"
          paginator
          :rows="8"
        >
          <template #empty>
            <div class="text-center text-sm">등록된 발주서가 없습니다.</div>
          </template>
          <DataCol
            selectionMode="single"
            headerStyle="width: 37px"
            bodyStyle="width: 37px"
            class="text-sm"
          />
          <DataCol
            field="pur_code"
            header="발주코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
            style="text-align: center"
          />
          <DataCol
            field="pur_name"
            header="발주서명"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="bcnc_name"
            header="매입처명"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="pur_date"
            header="발주일자"
            style="text-align: center"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="receipt_date"
            header="입고요청일자"
            style="text-align: center"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="emp_name"
            header="담당자"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="remark"
            header="비고"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
        </DataTable>
      </div>
    </template>
    <template #modal-footer>
      <button type="button" class="btn-white btn-common" @click="selectPur">확인</button>
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
