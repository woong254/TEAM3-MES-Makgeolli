<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'

// 부모에서 넘겨받는 props 정의
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
})

// 부모에게 보낼 이벤트 정의
const emit = defineEmits(['select', 'close'])

// 선택된 주문 항목
const selectedOrder = ref(null)

// 선택 시 부모로 emit
const confirmSelection = () => {
  if (selectedOrder.value) {
    emit('select', selectedOrder.value)
    emit('close')
    alert('조회성공!')
  } else {
    alert('주문서를 선택해주세요.')
  }
}

// 닫기 버튼 클릭 시
const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="주문서 선택"
      :fullScreenBackdrop="true"
      @close="closeModal"
      header-align="right"
      title-align="left"
    >
      <template #modal-body>
        <div class="modal-container">
          <DataTable
            v-model:selection="selectedOrder"
            dataKey="ord_id"
            :value="props.orders"
            showGridlines
            scrollable
            size="small"
            paginator
            :rows="8"
            class="text-sm z-[100001]"
          >
            <DataCol
              selectionMode="single"
              header=""
              style="width: 40px"
              :pt="{ columnHeaderContent: 'justify-center' }"
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

        <div class="flex justify-center mt-3 gap-3">
          <button type="button" class="btn-common btn-white" @click="confirmSelection">확인</button>
          <button type="button" class="btn-common btn-color" @click="closeModal">취소</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
