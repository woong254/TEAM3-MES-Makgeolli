<!-- 자재입고검사 가입고(검사대기)검색 및 선택 모달창 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import axios from 'axios'

// 1. TS 데이터타입 선언
interface matInspTargetDT {
  iis_id: string | number
  pur_code: string
  pur_name: string
  pur_date: string
  bcnc_name: string
  mat_code: string
  mat_name: string
  mat_spec: string
  mat_unit: string
  pur_qty: string | number
  receipt_qty: string | number
}

// 2. 모달 제어
const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close', 'checked'])
const closeModal = () => {
  emit('close')
}

// 3. 데이터 조회
// 3-1. 검사대상 데이터
const allInspData = ref<matInspTargetDT[]>([]) // 서버에서 받아온 원본
const inspTargetData = ref<matInspTargetDT[]>([]) // 테이블에 바인딩하는 데이터

// 3-2. 날짜데이터 형식 변경 ("pur_date": "2025-10-13T15:00:00.000Z" -> 2025-10-13)
// 3-2-1. 한국 타임존으로 변경
const fmtKST = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
// 3-2-2. 변경된 타임존 -> yyyy-MM-dd 형식으로 날짜 형식 변경
const toYmdKst = (iso: string) => {
  const parts = fmtKST.formatToParts(new Date(iso))
  const y = parts.find((p) => p.type === 'year')!.value
  const m = parts.find((p) => p.type === 'month')!.value
  const d = parts.find((p) => p.type === 'day')!.value
  return `${y}-${m}-${d}`
}

// 3-3. 실제 데이터 호출 함수 (조회)
const findMatInspData = async () => {
  try {
    const { data } = await axios.get('/api/matInspTarget') //구조분해할당(res.data)
    allInspData.value = data // 원본데이터 보관

    // 화면용으로 가공: 날짜 KST → YYYY-MM-DD
    inspTargetData.value = allInspData.value.map((r) => ({
      ...r,
      pur_date: toYmdKst(r.pur_date),
    }))
    console.log('조회결과:', data) //확인용
  } catch (err) {
    console.error('데이터 조회 오류:', err)
    allInspData.value = []
    inspTargetData.value = []
  }
}

// 3-4. 모달 열릴 때 데이터 조회
watch(
  () => props.visible, //부모가 내려주는 모달 열림 여부를 감시
  async (newVal) => {
    if (newVal) {
      // 초기상태(검색값/체크선택) 리셋
      // searchName.value = ''
      // searchType.value = ''
      // checkedData.value = []
      await findMatInspData() // 실제 데이터 호출
    }
  },
)

// 6. 확인버튼 -> 부모로 선택값 전달
const checkedData = ref<matInspTargetDT | null>(null)
const confirmData = () => {
  emit('checked', checkedData.value)
  emit('close')
}
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="검사대상"
      :fullScreenBackdrop="true"
      title-align="left"
      header-align="right"
      width="900px"
      @close="closeModal"
    >
      <template #modal-body>
        <div class="modal-container">
          <DataTable
            :value="inspTargetData"
            v-model:selection="checkedData"
            dataKey="iis_id"
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
              field="iis_id"
              header="가입고번호"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: center; width: 100px"
            />
            <Column
              field="pur_name"
              header="발주명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="pur_date"
              header="발주일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px; text-align: center"
            />
            <Column
              field="mat_name"
              header="자재명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="mat_spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="mat_unit"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="pur_qty"
              header="발주량"
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
