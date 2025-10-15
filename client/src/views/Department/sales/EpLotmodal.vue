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
  visible: boolean
  prod_code?: string
  prod_name?: string
  remain_qty: number
}>()
// 2. 부모에게 알릴 'close' 이벤트를 정의합니다, emit을 여기서 선언하는거
// emit은 상위 컴포넌트에 보내는 방법중 하나 defineEmits을 import해줘야함
const emit = defineEmits(['close', 'selectedEpLot'])
// 모달 내부에서 닫기 동작 시 호출될 함수
const closeModal = () => {
  emit('close') // 'close' 이벤트를 부모에게 발생시켜 닫아달라고 요청합니다.
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

// 위에 input박스 3개 초기 변수
const search = ref({
  prod_code: '',
  prod_name: '',
  cur_os_qty: '',
})

// 선택된 제품lot들 저장 장소
const selectedProducts = ref([])
// 선택한 제품lot들 지우는 함수
const resetSelectedProducts = () => {
  selectedProducts.value = []
}
// 선택한 제품lot들정보를 주문서조회에 보내는 함수
function selectedEpLot() {
  if (selectedProducts.value) {
    emit('selectedEpLot', selectedProducts.value)
    resetSelectedProducts()

    emit('close')
  }
}
interface EpLot {
  ep_lot: string
  epep_dt: string
  ep_qty: number
  lot_cur_os_qty: number
}

const EpLots = ref<EpLot[]>([])
// 제품 단위 select 조회
const viewEpLot = async () => {
  try {
    const result = await axios.get('/api/viewEpLot', { params: search.value })
    EpLots.value = result.data.map((lot: EpLot) => ({
      ...lot,
      lot_cur_os_qty: lot.lot_cur_os_qty || 0, // 초기값 0
    }))
  } catch (err) {
    console.error(err)
  }
}
// 모달창이 열리면 viewProdUnit실행
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      // 부모에서 받은 제품코드/이름을 세팅
      search.value.prod_code = props.prod_code ?? '' // undefined이면 빈 문자열
      search.value.prod_name = props.prod_name ?? ''

      await viewEpLot()
    }
  },
)
// 출고수량이 변하는 만큼 총출고수량 값이 실시간으로 바뀌도록
watch(
  EpLots,
  (newVal) => {
    const total = newVal.reduce((sum, lot) => sum + (lot.lot_cur_os_qty || 0), 0)
    search.value.cur_os_qty = total.toString()
    if (total > props.remain_qty) {
      alert('주문미출고수량보다 큰 수량입니다. 다시 입력해주세요')
      // 모든 출고수량 0으로 초기화
      EpLots.value.forEach((lot) => (lot.lot_cur_os_qty = 0))
      search.value.cur_os_qty = '0'
      return
    }
  },
  { deep: true }, // 내부 값까지 감시
)
// 출고수량 input박스 포커스를 잃었을때 재고수량보다 많으면 알람창 및 조정
const onBlurCheck = (row: EpLot) => {
  if (!row.lot_cur_os_qty) row.lot_cur_os_qty = 0 // 빈 값 처리
  if (row.lot_cur_os_qty > row.ep_qty) {
    alert(`출고수량은 재고수량(${row.ep_qty})보다 클 수 없습니다!`)
    row.lot_cur_os_qty = row.ep_qty // 최대값으로 자동 조정
  } else if (row.lot_cur_os_qty < 0) {
    row.lot_cur_os_qty = 0 // 음수 입력 방지
  }
}
</script>

<template>
  <div v-if="props.visible">
    <form action="">
      <Modal
        title="출고가능제품LOT선택"
        :fullScreenBackdrop="true"
        @close="closeModal"
        title-align="left"
        header-align="right"
      >
        <template #modal-body>
          <div class="modal-container flex gap-2 mb-2">
            <div class="w-2/3">
              <label :class="labelStyle" for="insp-name"> 제품코드 </label>
              <input
                type="text"
                id="bcnc_name"
                :class="inputStyle"
                v-model="search.prod_code"
                readonly
              />
            </div>
            <div class="w-2/3">
              <label :class="labelStyle" for="insp-name"> 제품명 </label>
              <input type="text" id="pic" :class="inputStyle" v-model="search.prod_name" readonly />
            </div>
            <div class="w-1/3">
              <label :class="labelStyle" for="insp-name"> 총출고수량 </label>
              <input
                type="text"
                id="pic"
                :class="inputStyle"
                v-model="search.cur_os_qty"
                readonly
              />
            </div>
          </div>
          <div class="modal-container">
            <DataTable
              v-model:selection="selectedProducts"
              datakey="ep_lot"
              :value="EpLots"
              showGridlines
              scrollable
              size="small"
              class="text-sm z-[100001]"
              paginator
              :rows="8"
            >
              <template #empty>
                <div class="text-center">완제품입고를 해주세요!</div>
              </template>
              <DataCol
                header=""
                :pt="{ columnHeaderContent: 'justify-center' }"
                selectionMode="multiple"
                style="width: 10px"
              />
              <DataCol
                field="ep_lot"
                header="LOT번호"
                :pt="{ columnHeaderContent: 'justify-center' }"
              />
              <DataCol
                field="epep_dt"
                header="유통기한"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="text-align: center"
              />
              <DataCol
                field="ep_qty"
                header="재고수량"
                :pt="{ columnHeaderContent: 'justify-center' }"
                style="text-align: right"
              />
              <DataCol
                field="lot_cur_os_qty"
                header="출고수량"
                :pt="{ columnHeaderContent: 'justify-center' }"
                ><template #body="{ data }">
                  <input
                    type="number"
                    v-model.number="data.lot_cur_os_qty"
                    class="w-full text-right border rounded px-1 py-0.5"
                    min="0"
                    :max="data.ep_qty"
                    @blur="onBlurCheck(data)"
                  />
                </template>
              </DataCol>
            </DataTable>
          </div>
          <div class="flex justify-center mt-3">
            <button type="button" class="btn-common btn-white" @click="selectedEpLot">확인</button>
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
