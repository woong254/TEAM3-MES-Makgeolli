<script setup lang="ts">
import { ref, defineEmits, watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import axios from 'axios'
// 모달창 관련
// 1. 부모로부터 'visible' prop을 받습니다.
const props = defineProps<{
  disabledProdCodes: string[]
  visible: boolean
}>()
// 2. 부모에게 알릴 'close' 이벤트를 정의합니다, emit을 여기서 선언하는거
// emit은 상위 컴포넌트에 보내는 방법중 하나 defineEmits을 import해줘야함
const emit = defineEmits(['close', 'selectedProductValue'])
// 모달 내부에서 닫기 동작 시 호출될 함수
const closeModal = () => {
  resetSelectedProducts() // 닫을 때 체크박스 선택된 제품들 해제
  rowUnselectHook() // 전체선택 체크박스 해제
  emit('close') // 'close' 이벤트를 부모에게 발생시켜 닫아달라고 요청합니다.
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
// 테이블 데이터 타입 선언
interface Product {
  prod_code: string
  prod_name: string
  prod_spec: string
}
// table data
const prod = ref<Product[]>([])
// 검색창 초기 변수
const search = ref({
  prod_name: '',
  prod_spec: '',
  prod_unit: '',
})
// 조회 버튼 누르면 실행되는 함수
const submitSearchForm = async () => {
  try {
    const result = await axios.get('/api/productsView', {
      params: search.value,
    })

    if (result.data.length === 0) {
      alert('조회 결과가 없습니다.')
      resetSearchForm()
    }
    prod.value = result.data
  } catch (err) {
    console.error('조회 중 오류 발생', err)
  }
}
// 초기화 버튼 누르면 실행회는 함수
const resetSearchForm = () => {
  search.value.prod_name = '' // v-model 값 초기화
  search.value.prod_spec = ''
  search.value.prod_unit = ''
}
// 선택된 제품들 저장 장소
const selectedProducts = ref<Product[]>([])
// 선택한 제품들 지우는 함수
const resetSelectedProducts = () => {
  selectedProducts.value = []
}
// 선택한 제품들정보를 주문서조회에 보내는 함수
function selectedProductValue() {
  if (selectedProducts.value) {
    emit('selectedProductValue', selectedProducts.value)
    resetSelectedProducts()
    resetSearchForm()
    rowUnselectHook() // 전체선택 체크박스 해제
    emit('close')
  }
}
// 제품 단위 타입 설정
interface ProdUnit {
  comncode_dtnm: string
}
// 제품 단위 변수 설정
const prodUnits = ref<ProdUnit[]>([])
// 제품 단위 select 조회
const viewProdUnit = async () => {
  try {
    const result = await axios.get('/api/viewProdUnit')
    prodUnits.value = result.data
  } catch (err) {
    console.error(err)
  }
}
// 모달창이 열리면 viewProdUnit실행
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      await viewProdUnit()
    }
  },
)

// 전체선택 기본값 false
const selectAll = ref(false)

// disabledProdCodes가 없는 행 선택
// includes : 배열에 매개변수 값이 있으면 true, 없으면 false
const isSelectableRow = (row: Product) => !props.disabledProdCodes.includes(row.prod_code)

// props.disabledProdCodes가 있는 행은 비활성화
const rowClassHook = (row: Product) => {
  return props.disabledProdCodes.includes(row.prod_code) ? 'disabled-row' : ''
}

// 전체 선택 변경
const selectAllChangeHook = (event: { checked: boolean }) => {
  selectAll.value = event.checked
  if (event.checked) {
    selectedProducts.value = prod.value.filter(isSelectableRow) // filter는 조건에 만족하는 요소만 모아서 새로운 배열을 만드는 메서드
  } else {
    selectedProducts.value = []
  }
}

// 한 행 선택 해제 시 전체 체크 해제
const rowUnselectHook = () => {
  selectAll.value = false
}
</script>

<template>
  <div v-if="props.visible">
    <form @submit.prevent="submitSearchForm" action="">
      <Modal
        title="제품선택"
        :fullScreenBackdrop="true"
        @close="closeModal"
        title-align="left"
        header-align="right"
      >
        <template #modal-header>
          <div class="flex justify-end">
            <button type="button" class="btn-common-modal btn-white" @click="resetSearchForm">
              초기화
            </button>
            <button type="submit" class="btn-common-modal btn-color">조회</button>
          </div>
        </template>
        <template #modal-body>
          <div class="modal-container flex gap-2 mb-2">
            <div class="w-1/3">
              <label :class="labelStyle" for="insp-name"> 제품명 </label>
              <input type="text" id="bcnc_name" :class="inputStyle" v-model="search.prod_name" />
            </div>
            <div class="w-1/3">
              <label :class="labelStyle" for="insp-name"> 규격 </label>
              <input type="text" id="pic" :class="inputStyle" v-model="search.prod_spec" />
            </div>
            <div class="w-1/3">
              <label :class="labelStyle" for="insp-name"> 단위 </label>
              <div class="relative z-20 bg-transparent">
                <select id="insp-type" :class="selectStyle" v-model="search.prod_unit">
                  <option value=""></option>
                  <option
                    v-for="unit in prodUnits"
                    :key="unit.comncode_dtnm"
                    :value="unit.comncode_dtnm"
                  >
                    {{ unit.comncode_dtnm }}
                  </option>
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
              v-model:selection="selectedProducts"
              datakey="prod_code"
              :value="prod"
              showGridlines
              scrollable
              size="small"
              class="text-sm z-[100001]"
              paginator
              :rows="8"
              :rowClass="rowClassHook"
              :select-all="selectAll"
              @select-all-change="selectAllChangeHook"
              @row-unselect="rowUnselectHook"
            >
              <DataCol
                header=""
                :pt="{ columnHeaderContent: 'justify-center' }"
                selectionMode="multiple"
                style="width: 10px"
              />
              <DataCol
                field="prod_code"
                header="제품코드"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="prod_name"
                header="제품명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="prod_spec"
                header="규격"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="text-align: right"
              />
              <DataCol
                field="prod_unit"
                header="단위"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
            </DataTable>
          </div>
          <div class="flex justify-center mt-3">
            <button type="button" class="btn-common btn-white" @click="selectedProductValue">
              확인
            </button>
            <button class="btn-common btn-color" @click="closeModal">취소</button>
          </div>
        </template>
      </Modal>
    </form>
  </div>
</template>

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
/* :deep >> 자식 컴포넌트나 특정 내부 요소를 타겟 */
:deep(.disabled-row) {
  opacity: 0.6; /* 불투명도 흐릿하게 만드는거 */
  pointer-events: none; /* 클릭 선택 못하게 */
  user-select: none; /* 사용자가 드래그 하지 못하게 */
}
:deep(.disabled-row .p-checkbox-box) {
  /* 비활성화 될경우 체크박스 배경색 */
  background-color: #f5f5f5;
  /* 비활성화 될경우 체크박스 선색 */
  border-color: #ccc;
}
</style>
