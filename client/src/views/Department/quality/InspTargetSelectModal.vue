<!-- 모달 : 품질기준관리 검사대상 조회 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import '@/assets/common.css'
import Modal from '@/components/ui/Modal.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import axios from 'axios'

// 모달 제어
const props = defineProps<{
  visible: boolean
}>()
const emit = defineEmits(['close', 'checked'])
const closeModal = () => {
  emit('close')
}

// 검사대상 데이터
const allInspData = ref<any[]>([]) // 서버에서 받아온 원본
const inspData = ref<any[]>([]) // 테이블에 바인딩하는 데이터

// 검색
const searchName = ref('')
const searchType = ref('')

// 모달 열릴 때 데이터 조회
watch(
  () => props.visible, //부모가 내려주는 모달 열림 여부를 감시
  async (newVal) => {
    if (newVal) {
      // 초기상태(검색값/체크선택) 리셋
      searchName.value = ''
      searchType.value = ''
      checkedData.value = []
      await findinspData() // 실제 데이터 호출
      inspData.value = allInspData.value
    }
  },
)

// 실제 데이터 호출 함수
const findinspData = async () => {
  try {
    const { data } = await axios.get('/api/inspTarget') //구조분해할당(res.data)
    // console.log('조회결과:', data) //확인용
    allInspData.value = data
  } catch (err) {
    console.error('데이터 조회 오류:', err)
    allInspData.value = []
  }
}

// 조회버튼 클릭시(검색)
const onSearch = async () => {
  try {
    const { data } = await axios.get('/api/inspTargetSearch', {
      params: {
        name: searchName.value,
        type: searchType.value,
      },
    })
    inspData.value = data
  } catch (err) {
    console.error('검색 오류:', err)
    inspData.value = []
  }
}

// 초기화버튼
const resetSearch = () => {
  searchName.value = ''
  searchType.value = ''
  inspData.value = [...allInspData.value]
}

// 확인버튼 -> 부모로 선택값 전달
const checkedData = ref<any[]>([])
const confirmData = () => {
  emit('checked', checkedData.value)
  emit('close')
}

// style
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
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
      <template #modal-header>
        <div class="flex justify-end">
          <button type="button" class="btn-common-modal btn-white" @click="resetSearch">
            초기화
          </button>
          <button type="button" class="btn-common-modal btn-color" @click="onSearch">조회</button>
        </div>
      </template>
      <template #modal-body>
        <div class="modal-container flex gap-2 mb-2">
          <div class="w-1/3">
            <label :class="labelStyle" for="insp-name"> 자재/제품명 </label>
            <input
              type="text"
              id="insp-name"
              :class="inputStyle"
              v-model="searchName"
              @keyup.enter="onSearch"
            />
          </div>
          <div class="w-1/3">
            <label :class="labelStyle" for="insp-type"> 품목구분 </label>
            <div class="relative z-20 bg-transparent">
              <select id="insp-type" :class="selectStyle" v-model="searchType">
                <option value="a1">주자재</option>
                <option value="a2">부자재</option>
                <option value="a3">재공품</option>
                <option value="a4">반제품</option>
                <option value="a5">완제품</option>
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
            :value="inspData"
            v-model:selection="checkedData"
            dataKey="t_id"
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
              selectionMode="multiple"
              :showSelectAll="false"
              style="width: 10px"
            />
            <Column
              field="t_id"
              header="자재/제품ID"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="t_name"
              header="자재/제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="t_category"
              header="구분"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column
              field="t_type_name"
              header="품목구분"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <Column field="t_spec" header="규격" :pt="{ columnHeaderContent: 'justify-center' }" />
            <Column
              field="t_unit_name"
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

<style scoped>
.modal-container {
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
