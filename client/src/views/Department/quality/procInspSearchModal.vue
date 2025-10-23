<!-- 공정검사 검색 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// 1. TS 데이터타입
interface modalRowDT {
  insp_id: string
  insp_name: string
  insp_date: string
  prod_name: string
  prod_spec: string
  comncode_dtnm: string
  insp_qty: number
  procs_no: number
  now_procs: string
}

// 2. props, emit
const props = defineProps<{
  visible: boolean
  rows: modalRowDT[] // 부모에서 넘겨주는 검색 결과
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'checked', row: modalRowDT): void
}>()

// 3. 모달 제어
const closeModal = () => {
  emit('close')
}

// 4. 선택값 (라디오 단일 선택)
const checkedData = ref<modalRowDT | null>(null)

const confirmData = () => {
  if (checkedData.value) {
    emit('checked', checkedData.value) // 선택한 행 부모에 전달
  }
  emit('close')
}

// 5. 날짜 변환 함수
function formatDateTime(dateInput: string | Date): string {
  const dateValue = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 6. 라디오버튼 초기화
watch(
  () => props.visible,
  (v) => {
    if (v) {
      // 모달 열릴 때마다 선택 초기화
      checkedData.value = null
    }
  },
)
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="조회"
      :fullScreenBackdrop="true"
      title-align="left"
      header-align="right"
      width="900px"
      @close="closeModal"
    >
      <template #modal-body>
        <div class="modal-container">
          <DataTable
            :value="props.rows"
            v-model:selection="checkedData"
            dataKey="insp_id"
            showGridlines
            scrollable
            size="small"
            class="text-sm z-[100001]"
            paginator
            :rows="8"
          >
            <template #empty>
              <div class="text-center">검색 결과가 없습니다.</div>
            </template>

            <Column
              header=""
              :pt="{ columnHeaderContent: 'justify-center' }"
              selectionMode="single"
              :showSelectAll="false"
              style="width: 10px"
            />
            <Column
              field="insp_name"
              header="검사명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="insp_date"
              header="검사일시"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: center"
            >
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.insp_date) }}
              </template>
            </Column>
            <Column
              field="now_procs"
              header="공정명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="prod_name"
              header="제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="prod_spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="comncode_dtnm"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="insp_qty"
              header="검사량"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: right"
            />
          </DataTable>
        </div>
        <div class="flex justify-center mt-3">
          <button class="btn-common btn-white" @click="confirmData">확인</button>
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
