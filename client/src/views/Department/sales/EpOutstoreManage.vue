<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import DataTable from 'primevue/datatable' // datatable 컴포넌트 import
import Column from 'primevue/column'
// import InputText from 'primevue/inputtext' // PrimeVue InputText 컴포넌트 import
import { ref, computed } from 'vue' // computed import 추가
// flatPickr 달력
import flatPickr from 'vue-flatpickr-component' // flatPickr 달력 컴포넌트 import
import 'flatpickr/dist/flatpickr.css' // flatPickr 달력 css import
import { Korean } from 'flatpickr/dist/l10n/ko.js' // 달련 한글 import
import '@/assets/common.css' // 한솔누나 css import
import axios from 'axios' // axios 연결
import BcncnameSelectmodal from './BcncnameSelectmodal.vue' // 거래처, 대표자 클릭시 조회 모달창
const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

// 주문서관리-주문서조회검색 검색input 인터페이스
interface SearchCondition {
  ord_name: string
  bcnc_name: string
  prod_name: string
  Is: string // 주문완료
  Os: string // 출고완료
  OsIP: string // 출고진행중
  due_start_date: string // 납기일자 시작일
  due_end_date: string // 납기일자 시작일
  ep_start_date: string // 유통기한
  ep_end_date: string
}
// 주문제품 테이블 인터페이스 (Product 인터페이스를 대체)
interface OrderItem {
  ofd_no: number
  ord_name: string
  bcnc_name: string
  prod_code: string
  prod_name: string
  prod_spec: string
  prod_unit: string
  ord_qty: number // 주문수량
  due_date: string
  ep_lot: string
  epep_dt: string
  ep_qty: number
  cur_os_qty: number // 현출고수량
  shipped_qty: number // 기출고수량 = 주문제품출고수량
  remain_qty: number // 미출고수량
  comncode_dtnm: string
  remark: string
  orig_ord_eps_qty: number // DB에서 가져온 기존 기출고수량
}

// 선택한 제품들
const selectedProducts = ref<OrderItem[]>([])
// products ref에 OrderItem[] 타입을 명시적으로 지정
const products = ref<OrderItem[]>([])
// 주문서조회검색 input태그 데이터 초기값
const search = ref<SearchCondition>({
  ord_name: '',
  bcnc_name: '',
  prod_name: '',
  Is: '', // 주문완료
  Os: '', // 출고완료
  OsIP: '', // 출고진행중
  due_start_date: '', // 납기일자 시작일
  due_end_date: '', // 납기일자 시작일
  ep_start_date: '', // 유통기한
  ep_end_date: '',
})

// 페이지 타이틀
const currentPageTitle = ref('완제품출고관리')

// 납기일자 시작일 설정 (종료일이 있다면 maxDate 설정)
const dueStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: search.value.due_end_date,
  locale: Korean,
}))

// 납기일자 종료일 설정 (시작일이 있다면 minDate 설정)
const dueEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최소 날짜로 설정하여 범위를 제한
  minDate: search.value.due_start_date,
  locale: Korean,
}))

// 납기일자 시작일 설정 (종료일이 있다면 maxDate 설정)
const epStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: search.value.ep_end_date,
  locale: Korean,
}))

// 납기일자 종료일 설정 (시작일이 있다면 minDate 설정)
const epEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최소 날짜로 설정하여 범위를 제한
  minDate: search.value.ep_start_date,
  locale: Korean,
}))

// 주문서 조회 검색 버튼 누르면 실행하는 함수
const submitSearchForm = () => {
  console.log(search.value)

  // 컴포넌트가 마운트될 때 주문서조회 데이터 가져오기
  getEpOsManage()
}

// 완제품 입고 관리 검색 조회 버튼 눌렀을때 데이터 가져오는 함수
const getEpOsManage = async (showAlert = true) => {
  try {
    const result = await axios.get('/api/viewEpOsManage', {
      params: search.value,
    })
    const rows = result.data

    if (rows.length === 0) {
      alert('조회 결과가 없습니다.')
      products.value = []
      return
    }

    const computedRows = rows.map((row: OrderItem) => {
      const ord = row.ord_qty || 0 // 주문수량
      const ord_eps = row.shipped_qty || 0 // DB 기준 기출고수량

      return {
        ...row,
        orig_ord_eps_qty: ord_eps, // 기존 누적 기출고량 저장
        shipped_qty: ord_eps, // 현재 화면에 표시할 기출고량
        remain_qty: Math.max(ord - ord_eps, 0), // 미출고수량 = 주문수량 - 기존기출
        cur_os_qty: null, // 입력칸 초기화
      }
    })

    selectedProducts.value = []
    products.value = computedRows
    console.log('조회버튼 누르고 나오는 products.value 값:', products.value)
    if (showAlert) alert('조회성공!')
  } catch (err) {
    console.error('getEpIsManage 오류:', err)
  }
}

// 주문서 조회 검색에 있는 초기화 버튼 누르면 실행되는 함수
const resetSearchForm = () => {
  search.value.ord_name = ''
  search.value.bcnc_name = ''
  search.value.prod_name = ''
  search.value.Is = '' // 주문완료
  search.value.Os = '' // 출고완료
  search.value.OsIP = '' // 출고진행중
  search.value.due_start_date = '' // 납기일자 시작일
  search.value.due_end_date = '' // 납기일자 시작일
  search.value.ep_start_date = '' // 유통기한
  search.value.ep_end_date = '' // 유통기한
}
// 출고할때 필요한 데이터 인터페이스
interface EpOsRequest {
  prod_code: string
  ofd_no: number
  ep_lot: string
  ord_epos_qty: number
  remark: string
}
// 출고버튼 기능
const submitEpOs = async () => {
  const obj: EpOsRequest[] = selectedProducts.value.map((item) => ({
    prod_code: item.prod_code,
    ofd_no: item.ofd_no,
    ep_lot: item.ep_lot,
    ord_epos_qty: item.cur_os_qty,
    remark: item.remark || '',
  }))
  console.log(obj)

  try {
    if (selectedProducts.value.length === 0) {
      alert('출고할 주문서 제품을 선택해주세요')
      return
    }
    // 출고버튼을 눌렀을 때 제품현출고수량이 0이면은 알람이 뜸
    for (const item of selectedProducts.value) {
      if (item.cur_os_qty < 1 || item.cur_os_qty === null) {
        alert('출고할 제품 수량을 입력해주세요')
        return // submitEpOs 함수 종료
      }
      if (item.comncode_dtnm === '출고완료') {
        alert('출고완료 제품은 출고 할 수 없습니다.')
        return // submitEpOs 함수 종료
      }
    }
    // 저장
    const result = await axios.post('/api/insertEpOs', obj)
    const addRes = result.data

    if (!addRes.isSuccessed) {
      alert('출고가 이루어지지 않았습니다. 데이터를 확인해보세요.')
      return
    } else {
      alert('출고완료')
    }
    getEpOsManage(false)

    selectedProducts.value = []
  } catch (err) {
    console.error('추가 중 오류 발생', err)
    alert('서버 요청 중 오류가 발생했습니다.')
  }
}

// 거래처 모달창 열고 닫을 수 있음
const BcncnameModal = ref(false)
const BcncnameOpenmodal = () => {
  BcncnameModal.value = true
}
const BcncnameClosemodal = () => {
  BcncnameModal.value = false
}
const BcncSelect = (value: SearchCondition) => {
  console.log(value.bcnc_name)
  search.value.bcnc_name = value.bcnc_name
}
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <form @submit.prevent="submitSearchForm" action="">
        <ComponentCard title="완제품 출고 관리 검색">
          <template #header-right>
            <div class="">
              <button type="button" class="btn-white btn-common" @click="resetSearchForm">
                초기화
              </button>
              <button type="button" class="btn-color btn-common" @click="submitSearchForm">
                조회
              </button>
            </div>
          </template>
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="주문서이름을 입력해주세요"
                  v-model="search.ord_name"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  거래처명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="거래처이름을 입력해주세요"
                  v-model="search.bcnc_name"
                  @focus="BcncnameOpenmodal"
                  required
                />
                <BcncnameSelectmodal
                  @selectedBcncValue="BcncSelect"
                  :visible="BcncnameModal"
                  @close="BcncnameClosemodal"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  제품명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="제품이름을 입력해주세요"
                  v-model="search.prod_name"
                  required
                />
              </div>
              <div class="w-1/4">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  입고상태
                </div>
                <div class="flex items-center gap-3">
                  <label class="flex items-center text-sm text-gray-800 whitespace-nowrap">
                    <input
                      type="checkbox"
                      true-value="출고완료"
                      false-value=""
                      v-model="search.Os"
                      class="mr-1"
                    />출고완료
                  </label>
                  <!-- <label class="flex items-center text-sm text-gray-800 whitespace-nowrap">
                    <input
                      type="checkbox"
                      true-value="출고진행중"
                      false-value=""
                      v-model="search.OsIP"
                      class="mr-1"
                    />출고진행중
                  </label> -->
                  <label class="flex items-center text-sm text-gray-800 whitespace-nowrap">
                    <input
                      type="checkbox"
                      true-value="주문완료"
                      false-value=""
                      v-model="search.Is"
                      class="mr-1"
                    />주문완료
                  </label>
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  납기일자
                </label>
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <!-- 납기일자 시작일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.due_start_date"
                      :config="dueStartDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="시작일"
                    />
                    <span
                      class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                  <span>ㅡ</span>
                  <!-- 납기일자 종료일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.due_end_date"
                      :config="dueEndDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="종료일"
                    />
                    <span
                      class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  유통기한
                </label>
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <!-- 유통기한 시작일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ep_start_date"
                      :config="epStartDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="시작일"
                    />
                    <span
                      class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                  <span>ㅡ</span>
                  <!-- 유통기한 종료일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ep_end_date"
                      :config="epEndDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="종료일"
                    />
                    <span
                      class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                          fill=""
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </ComponentCard>
      </form>
    </div>
    <form action="" id="submitEpIs" @submit.prevent="submitEpOs">
      <div class="space-y-5 sm:space-y-6 mt-2">
        <ComponentCard title="완제품 출고 관리">
          <template #header-right>
            <div class="flex items-center">
              <button type="submit" class="btn-color btn-common">출고</button>
            </div>
          </template>
          <template #body-content>
            <div ref="tableWrapper" class="order-table-wrapper h-105">
              <!-- :rowClass는 동적으로 css클래스를 적용하는거,  -->
              <!-- :select-all="selectAll" selectAll이 true면 전체 선택 체크박스가 체크된 상태로 표시 -->
              <!-- @select-all-change="selectAllChangeHook" 전체 선택 이벤트 발생할때, 전체 선택 시 비활성화 된 행빼고 선택하게 -->
              <!-- @row-unselect="rowUnselectHook" 전체선택된 상태에서 하나라도 행이 선택해제한다면 동시에 전체선택도 해제 -->
              <DataTable
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="ofd_no"
                tableStyle="max-width: 100%;"
                selectionMode="multiple"
                showGridlines
                scrollable
                scrollHeight="390px"
                size="small"
                class="text-sm"
              >
                <template #empty>
                  <div class="text-center">조회를 먼저해주세요!</div>
                </template>
                <Column
                  selectionMode="multiple"
                  headerStyle="width: 1%"
                  field="ofd_no"
                  frozen
                ></Column>
                <Column
                  field="ord_name"
                  header="주문서명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px"
                ></Column>
                <Column
                  field="bcnc_name"
                  header="거래처"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px"
                ></Column>
                <Column
                  field="prod_code"
                  header="제품코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 170px"
                ></Column>
                <Column
                  field="prod_name"
                  header="제품명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 170px"
                ></Column>
                <Column
                  field="prod_spec"
                  header="규격"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 50px; text-align: right"
                ></Column>
                <Column
                  field="prod_unit"
                  header="단위"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 70px"
                ></Column>
                <Column
                  field="ord_qty"
                  header="주문수량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px; text-align: right"
                ></Column>
                <Column
                  field="due_date"
                  header="납기일자"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px; text-align: right"
                ></Column>
                <Column
                  field="ep_lot"
                  header="제품LOT번호"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px"
                ></Column>
                <Column
                  field="epep_dt"
                  header="유통기한"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px; text-align: center"
                ></Column>
                <Column
                  field="ep_qty"
                  header="제품재고수량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px; text-align: right"
                ></Column>
                <Column
                  field="cur_os_qty"
                  header="제품현출고수량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 110px; text-align: right"
                  ><template #body="{ data }">
                    <input
                      v-model="data.cur_os_qty"
                      type="number"
                      :class="baseInputClass"
                      style="text-align: right"
                      :max="Math.min(data.ep_qty, data.ord_qty)"
                      :min="1"
                      step="1"
                    /> </template
                ></Column>
                <Column
                  field="remain_qty"
                  header="주문미출고수량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 110px; text-align: right"
                >
                </Column>
                <Column
                  field="shipped_qty"
                  header="주문기출고수량"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 110px; text-align: right"
                ></Column>
                <Column
                  field="comncode_dtnm"
                  header="출고상태"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 100px"
                ></Column>
                <Column
                  field="remark"
                  header="비고"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="min-width: 170px"
                >
                  <template #body="{ data }">
                    <input v-model="data.remark" type="text" :class="baseInputClass" />
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </ComponentCard>
      </div>
    </form>
  </AdminLayout>
</template>

<style scoped>
input {
  height: 40px; /* input 높이 */
  line-height: 40px; /* line-height를 input 높이와 같게 */
  padding: 0 10px; /* 좌우 패딩 */
}
:deep(.disabled-row) {
  opacity: 0.6; /* 불투명도 흐릿하게 만드는거 */
  pointer-events: none; /* 클릭 선택 못하게 */
  user-select: none; /* 사용자가 드래그 하지 못하게 */
}
:deep(.disabled-row .p-checkbox-box) {
  /* 비활성화 될경우 체크박스 배경색 */
  background-color: #f5f5f5 !important;
  /* 비활성화 될경우 체크박스 선색 */
  border-color: #ccc !important;
}
</style>
