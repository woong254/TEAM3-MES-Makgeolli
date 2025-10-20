<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { watch, ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  // 부모가 현재 발주서에 이미 담은 자재코드 목록
  blockedCodes: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'close', 'select'])
const close = () => emit('close')

const modalMat = ref([])
const searchName = ref('')
const selectModalMat = ref([])

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const blocked = computed(() => new Set(props.blockedCodes))

const displayed = computed(() => modalMat.value.filter((r) => !blocked.value.has(r?.mat_code)))

const pruneSelection = () => {
  if (!Array.isArray(selectModalMat.value)) return
  selectModalMat.value = selectModalMat.value.filter((r) => !blocked.value.has(r?.mat_code))
}
watch(() => props.blockedCodes, pruneSelection)

const getMatList = async () => {
  try {
    const response = await axios.get('/api/purMatList')
    modalMat.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const searchMatList = async () => {
  const q = searchName.value.trim()
  try {
    let response
    if (q) {
      response = await axios.get('/api/purMatTarget', { params: { mat_name: q } })
      if (!response.data || response.data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getMatList()
        return
      }
    } else {
      response = await axios.get('/api/purMatList')
    }
    modalMat.value = response.data
  } catch (error) {
    console.error('Error searching data:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) getMatList()
    else {
      selectModalMat.value = []
      searchName.value = ''
    }
  },
)

const selectMat = () => {
  if (Array.isArray(selectModalMat.value) && selectModalMat.value.length > 0) {
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
    footer-align="center"
    width="1000px"
  >
    <template #modal-header>
      <button type="button" class="btn-color btn-common" @click="searchMatList">조회</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">자재명</label>
          <input
            type="text"
            v-model="searchName"
            :class="baseInputClass"
            @keyup.enter="searchMatList"
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
          style="width: 1600px"
          paginator
          :rows="8"
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
            style="text-align: right"
          />
          <DataCol
            field="safe_stock"
            header="안전재고"
            :pt="{ columnHeaderContent: 'justify-center' }"
            style="text-align: right"
          />
          <DataCol field="mat_spec" header="규격" :pt="{ columnHeaderContent: 'justify-center' }" />
          <DataCol field="mat_unit" header="단위" :pt="{ columnHeaderContent: 'justify-center' }" />
        </DataTable>
      </div>
    </template>
    <template #modal-footer>
      <button type="button" class="btn-white btn-common" @click="selectMat">확인</button>
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
