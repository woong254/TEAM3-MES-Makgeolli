<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch, computed } from 'vue'
import axios from 'axios'
const modalBcnc = ref([])
const searchName = ref('')
const selectModalBcnc = ref(null)
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const blockedCodeSet = computed(() => new Set(props.blockedCodes ?? []))
const blockedNameSet = computed(() => new Set(props.blockedNames ?? []))

const props = defineProps({
  modelValue: Boolean,
  matCode: { type: String, default: '' },
  blockedCodes: { type: Array, default: () => [] },
  blockedNames: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'close', 'select'])
const close = () => emit('close')

const displayed = computed(() => {
  const arr = Array.isArray(modalBcnc.value) ? modalBcnc.value : []
  return arr.filter(
    (r) => !blockedCodeSet.value.has(r?.bcnc_code) && !blockedNameSet.value.has(r?.bcnc_name),
  )
})

watch([blockedCodeSet, blockedNameSet], () => {
  if (
    selectModalBcnc.value &&
    (blockedCodeSet.value.has(selectModalBcnc.value?.bcnc_code) ||
      blockedNameSet.value.has(selectModalBcnc.value?.bcnc_name))
  ) {
    selectModalBcnc.value = null
  }
})

const getBcncList = async () => {
  try {
    let response
    if (props.matCode) {
      response = await axios.get('/api/iisBcncList', { params: { mat_code: props.matCode } })
    } else {
      response = await axios.get('/api/iisBcncList')
    }
    modalBcnc.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const searchBcnc = async () => {
  const q = searchName.value.trim()
  try {
    let response
    if (q) {
      response = await axios.get('/api/iisBcncList', {
        params: { bcnc_name: q, mat_code: props.matCode || undefined },
      })
      if (!response.data || response.data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getBcncList()
        return
      }
    } else {
      response = await axios.get('/api/iisBcncList', {
        params: { mat_code: props.matCode || undefined },
      })
    }
    modalBcnc.value = response.data
  } catch (error) {
    console.error('Error searching data:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) getBcncList()
    else {
      selectModalBcnc.value = null
      searchName.value = ''
    }
  },
)

const selectBcnc = () => {
  if (selectModalBcnc.value) {
    emit('select', selectModalBcnc.value)
    emit('update:modelValue', false)
    emit('close')
  } else {
    alert('매입처를 선택해주세요.')
  }
}
</script>

<template>
  <Modal
    v-if="props.modelValue"
    @close="close"
    title="매입처 조회"
    title-align="left"
    header-align="right"
    width="600px"
  >
    <template #modal-header>
      <button type="button" class="btn-white btn-common" @click="searchBcnc">조회</button>
      <button type="button" class="btn-color btn-common" @click="selectBcnc">등록</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">매입처명</label>
          <input
            type="text"
            v-model="searchName"
            :class="baseInputClass"
            @keyup.enter="searchBcnc"
            style="width: 200px"
          />
        </div>
      </div>

      <div class="modal-container flex gap-2 mb-2">
        <DataTable
          :value="displayed"
          show-gridlines
          v-model:selection="selectModalBcnc"
          dataKey="bcnc_code"
          style="width: 800px"
          paginator
          :rows="8"
        >
          <DataCol selectionMode="single" headerStyle="width: 37px" bodyStyle="width: 37px" />
          <template #empty>
            <div class="text-center">오늘 입고될 자재가 없습니다.</div>
          </template>
          <DataCol
            field="bcnc_code"
            header="매입처코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
            style="width: 130px"
          />
          <DataCol
            field="bcnc_name"
            header="매입처명"
            :pt="{ columnHeaderContent: 'justify-center' }"
          />
          <DataCol
            field="bcnc_category"
            header="업종"
            style="width: 180px"
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
