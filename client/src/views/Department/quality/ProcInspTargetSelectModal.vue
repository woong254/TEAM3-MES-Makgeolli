<!-- 공정검사 공정실적번호(완제품)검색 및 선택 모달창 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import axios from 'axios'

// 1. TS 데이터타입 선언
interface prodInspTargetDT {
  procs_no: number
  prod_code: string
  prod_name: string
  prod_spec: string
  comncode_dtnm: string
  mk_qty: number
  procs_endtm: string
  now_procs: string
}

// 2. 모달제어
const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close', 'checked'])
const closeModal = () => {
  emit('close')
}

// 3. 데이터 조회
// 3-1. 검사대상 데이터
const allInspData = ref<prodInspTargetDT[]>([]) // 서버에서 받아온 원본
const inspTargetData = ref<prodInspTargetDT[]>([]) // 테이블에 바인딩하는 데이터

// 3-2. 실제 데이터 호출 함수(조회)
const findProcInspData = async () => {
  try {
    const { data } = await axios.get('/api/procInspTargetSearch')

    // 1) 배열인지 확인
    if (!Array.isArray(data)) {
      allInspData.value = []
      inspTargetData.value = []
      return
    }

    // 2) 간단한 변환 (map)
    const normalized = data.map((row: any) => {
      return {
        procs_no: Number(row.procs_no),
        prod_code: row.prod_code || '',
        prod_name: row.prod_name || '',
        prod_spec: row.prod_spec || '',
        comncode_dtnm: row.comncode_dtnm || '',
        mk_qty: Number(row.mk_qty || 0),
        procs_endtm: formatDateTime(row.procs_endtm),
        now_procs: row.now_procs || '',
      }
    })

    // 3) 상태에 저장
    allInspData.value = normalized
    inspTargetData.value = normalized

    console.log('조회결과:', normalized)
  } catch (err) {
    console.error('데이터 조회 오류:', err)
    allInspData.value = []
    inspTargetData.value = []
  }
}

// 3-3. 모달 열릴 때 데이터 자동 조회
watch(
  () => props.visible, //부모가 내려주는 모달 열림 여부를 감시
  async (newVal) => {
    if (newVal) {
      await findProcInspData()
    }
  },
)

// 4. 확인버튼 -> 부모로 선택값 전달
const checkedData = ref<prodInspTargetDT | null>(null)
const confirmData = () => {
  emit('checked', checkedData.value)
  emit('close')
}

// 5. 날짜 변환 함수
// 날짜 포맷 변환 함수 따로 빼두면 보기 쉽습니다
function formatDateTime(value: any): string {
  if (!value) return ''
  const date = new Date(value)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}
</script>

<template>
  <div v-if="props.visible">
    <Modal
      title="검사대상"
      :fullScreenBackdrop="true"
      title-align="left"
      header-align="right"
      width="1000px"
      @close="closeModal"
    >
      <template #modal-body>
        <div class="modal-container">
          <DataTable
            :value="inspTargetData"
            v-model:selection="checkedData"
            dataKey="procs_no"
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
              field="procs_no"
              header="공정실적번호"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: center; width: 100px"
            />
            <Column
              field="now_procs"
              header="공정명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="prod_code"
              header="제품코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="prod_name"
              header="제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 250px"
            />
            <Column
              field="procs_endtm"
              header="작업종료일시"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="mk_qty"
              header="생산량"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: right"
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
          </DataTable>
        </div>
        <div class="flex justify-center mt-3">
          <button class="btn-common btn-white" @click="confirmData">확인</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped></style>
