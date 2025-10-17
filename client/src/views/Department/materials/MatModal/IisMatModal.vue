<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  bcncCode: { type: String, default: '' },
  blockedCodes: { type: Array, default: () => [] },
  blockedNames: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'close', 'select'])
const close = () => emit('close')

const modalPur = ref([])
const searchName = ref('')
const selectModalMat = ref(null)

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const blockedCodeSet = computed(() => new Set(props.blockedCodes ?? []))
const blockedNameSet = computed(() => new Set(props.blockedNames ?? []))

const displayed = computed(() => {
  const arr = Array.isArray(modalPur.value) ? modalPur.value : []
  return arr.filter(
    (r) => !blockedCodeSet.value.has(r?.mat_code) && !blockedNameSet.value.has(r?.mat_name),
  )
})

watch([blockedCodeSet, blockedNameSet], () => {
  if (
    selectModalMat.value &&
    (blockedCodeSet.value.has(selectModalMat.value?.mat_code) ||
      blockedNameSet.value.has(selectModalMat.value?.mat_name))
  ) {
    selectModalMat.value = null
  }
})

const getIisList = async () => {
  try {
    const { data } = await axios.get('/api/iisMatMasterList', {
      params: { bcnc_code: props.bcncCode || undefined },
    })
    modalPur.value = data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const searchIis = async () => {
  const q = searchName.value.trim()
  try {
    let response
    if (q) {
      response = await axios.get('/api/iisMatMasterList', {
        params: { bcnc_code: props.bcncCode || undefined, mat_name: q },
      })
      if (!response.data || response.data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getIisList()
        return
      }
    } else {
      response = await axios.get('/api/iisMatMasterList', {
        params: { bcnc_code: props.bcncCode || undefined },
      })
    }
    modalPur.value = response.data
  } catch (error) {
    console.error('Error searching data:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

// 기존: 모달 열림/닫힘 감시
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (!props.bcncCode) {
        // alert('먼저 매입처를 선택하세요.'); // 필요 시 사용
      }
      getIisList()
    } else {
      selectModalMat.value = null
      searchName.value = ''
    }
  },
)

// ✅ 추가: 매입처(bcncCode) 변경 감시 — 모달이 열려 있으면 재조회
watch(
  () => props.bcncCode,
  (nv, ov) => {
    if (props.modelValue && nv !== ov) {
      getIisList()
    }
  },
)

const selectMat = () => {
  if (selectModalMat.value) {
    emit('select', selectModalMat.value)
    emit('update:modelValue', false)
    emit('close')
  } else {
    alert('자재를 선택해주세요.')
  }
}
</script>

<template>
  <Modal
    v-if="props.modelValue"
    @close="close"
    title="발주자재 조회"
    title-align="left"
    header-align="right"
    width="1200px"
  >
    <template #modal-header>
      <button type="button" class="btn-white btn-common" @click="searchIis">조회</button>
      <button type="button" class="btn-color btn-common" @click="selectMat">등록</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">자재명</label>
          <input
            type="text"
            v-model="searchName"
            :class="baseInputClass"
            @keyup.enter="searchIis"
            style="width: 200px"
          />
        </div>
      </div>

      <div class="modal-container flex gap-2 mb-2">
        <DataTable
          :value="displayed"
          show-gridlines
          v-model:selection="selectModalMat"
          dataKey="mat_code"
          style="width: 1200px"
          paginator
          :rows="8"
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
            field="bcnc_code"
            header="매입처코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="bcnc_name"
            header="매입처명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
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
          <DataCol field="mat_spec" header="규격" :pt="{ columnHeaderContent: 'justify-center' }" />
          <DataCol field="mat_unit" header="단위" :pt="{ columnHeaderContent: 'justify-center' }" />
          <DataCol
            field="unreceipt_qty"
            header="미입고량"
            style="text-align: right"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="receipt_status"
            header="입고상태"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
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
