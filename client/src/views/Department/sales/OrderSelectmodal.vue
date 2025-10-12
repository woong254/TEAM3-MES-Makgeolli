<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import axios from 'axios'
// 모달창 관련
// 1. 부모로부터 'visible' prop을 받습니다.
const props = defineProps<{
  visible: boolean
}>()
// 2. 부모에게 알릴 'close' 이벤트를 정의합니다, emit을 여기서 선언하는거
// emit은 상위 컴포넌트에 보내는 방법중 하나 defineEmits을 import해줘야함
const emit = defineEmits(['close', 'selectedorder'])
// 모달 내부에서 닫기 동작 시 호출될 함수
const closeModal = () => {
  emit('close') // 'close' 이벤트를 부모에게 발생시켜 닫아달라고 요청합니다.
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

// table data
const order = ref([])
// 검색창 초기 변수
const search = ref({
  ord_name: '',
})
// 초기화 버튼 누르면 실행회는 함수
const resetSearchForm = () => {
  search.value.ord_name = '' // v-model 값 초기화
}
// 선택된 저장 장소
const selectedOrder = ref(null)
const resetSelectedOrder = () => {
  selectedOrder.value = null
}
// 선택한 거래처들, 대표자들 주문서조회에 보내는 함수
function selectedorder() {
  if (selectedOrder.value) {
    emit('selectedorder', selectedOrder.value)
    console.log(selectedOrder.value)
    resetSelectedOrder()
    emit('close')
  }
}
// 조회 버튼 누르면 실행되는 함수
const submitSearchForm = async () => {
  try {
    const result = await axios.get('/api/ordFormManageView', {
      params: search.value,
    })
    console.log('result.data조회 결과:', result.data)
    console.log('result조회 결과:', result)
    const list = result.data.list

    if (!list || list.length === 0) {
      alert('조회 결과가 없습니다.')
      resetSearchForm()
      return
    }
    order.value = list
    console.log('order.value조회 결과:', order.value)
  } catch (err) {
    console.error('조회 중 오류 발생', err)
  }
}
</script>

<template>
  <div v-if="props.visible">
    <form @submit.prevent="submitSearchForm" action="">
      <Modal
        title="주문서선택"
        :fullScreenBackdrop="true"
        @close="closeModal"
        header-align="right"
        title-align="left"
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
              <label :class="labelStyle" for="insp-name"> 주문서명 </label>
              <input type="text" id="ord_name" :class="inputStyle" v-model="search.ord_name" />
            </div>
          </div>
          <div class="modal-container">
            <DataTable
              v-model:selection="selectedOrder"
              datakey="ord_id"
              :value="order"
              showGridlines
              scrollable
              size="small"
              class="text-sm z-[100001]"
              paginator
              :rows="8"
            >
              <DataCol
                header=""
                :pt="{ columnHeaderContent: 'justify-center' }"
                selectionMode="single"
                style="width: 10px"
              />
              <DataCol
                field="ord_name"
                header="주문서명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="bcnc_name"
                header="거래처명"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="ord_date"
                header="주문날짜"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="due_date"
                header="납기일자"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="emp_name"
                header="주문서작성담당자"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
            </DataTable>
          </div>
          <div class="flex justify-center mt-3">
            <button type="button" class="btn-common btn-white" @click="selectedorder">확인</button>
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
</style>
