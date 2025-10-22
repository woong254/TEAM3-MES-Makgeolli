<script setup>
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, watch, computed } from 'vue'
import axios from 'axios'

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

const displayed = computed(() => modalPur.value)

/** 숫자 표시: 항상 소수점 2자리(천단위 콤마 포함) */
const fmtQty = (v) => {
  if (v === null || v === undefined || v === '') return ''
  let s = v
  if (typeof s === 'string') s = s.replace(/[, ]+/g, '').trim()
  const n = Number(s)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 전체 목록 조회 */
const getPurList = async () => {
  try {
    const { data } = await axios.get('/api/iis/matList')
    modalPur.value = data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

/** 검색 */
const searchPur = async () => {
  const q = (searchName.value || '').trim()
  try {
    if (q) {
      const { data } = await axios.get('api/iis/matSearch', { params: { mat_name: q } })
      if (!data || data.length === 0) {
        alert('조회 결과가 없습니다.')
        await getPurList()
        return
      }
      modalPur.value = data
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
    title="발주자재 조회"
    title-align="left"
    header-align="right"
    width="1200px"
  >
    <template #modal-header>
      <button type="button" class="btn-color btn-common" @click="searchPur">조회</button>
    </template>

    <template #modal-body>
      <div class="modal-container flex gap-2 mb-2">
        <div class="w-1/3">
          <label :class="labelStyle">자재명</label>
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
        <DataTable :value="displayed" show-gridlines style="width: 1200px" paginator :rows="8">
          <template #empty>
            <div class="text-center text-sm">오늘 입고될 자재가 없습니다.</div>
          </template>
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
            field="bcnc_code"
            header="매입처코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
            style="text-align: center"
          />
          <DataCol
            field="bcnc_name"
            header="매입처명"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="mat_code"
            header="자재코드"
            :pt="{ columnHeaderContent: 'justify-center' }"
            style="text-align: center"
            class="text-sm"
          />
          <DataCol
            field="mat_name"
            header="자재명"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="mat_spec"
            header="규격"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <DataCol
            field="mat_unit"
            header="단위"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          />
          <!-- ✅ 미입고량: 항상 2자리 소수 표시 -->
          <DataCol
            field="unreceipt_qty"
            header="미입고량"
            style="text-align: right"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
          >
            <template #body="{ data }">{{ fmtQty(data.unreceipt_qty) }}</template>
          </DataCol>
          <DataCol
            field="receipt_status"
            header="입고상태"
            :pt="{ columnHeaderContent: 'justify-center' }"
            class="text-sm"
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
