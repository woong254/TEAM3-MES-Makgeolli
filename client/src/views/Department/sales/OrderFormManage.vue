<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardOrder.vue'
import DataTable from 'primevue/datatable' // datatable 컴포넌트 import
import Column from 'primevue/column'
// import InputText from 'primevue/inputtext' // PrimeVue InputText 컴포넌트 import
import { defineProps, ref, computed, toRaw } from 'vue' // computed import 추가
// flatPickr 달력
import flatPickr from 'vue-flatpickr-component' // flatPickr 달력 컴포넌트 import
import 'flatpickr/dist/flatpickr.css' // flatPickr 달력 css import
import { Korean } from 'flatpickr/dist/l10n/ko.js' // 달련 한글 import
import '@/assets/common.css' // 한솔누나 css import
import BcncnameSelectmodal from './BcncnameSelectmodal.vue' // 거래처, 대표자 클릭시 조회 모달창
import pdfDownload from './pdfDownload.vue' // pdf다운로드
import ProductSelectmodal from './ProductSelectmodal.vue' // 제품선택
import InputNumber from 'primevue/inputnumber' // 수량입력칸
import axios from 'axios' // axios 노드쪽 연결
import isEqual from 'lodash/isEqual'

// 주문서관리 props 인터페이스
interface Props {
  title: string
  className?: string
  desc?: string
}
// 주문서관리-주문서조회검색 검색input 인터페이스
interface SearchCondition {
  ord_name: string
  ord_start_date: string // 주문일자 시작일
  ord_end_date: string // 주문일자 종료일
  due_start_date: string // 납기일자 시작일
  due_end_date: string // 납기일자 시작일
}
// 주문제품 테이블 인터페이스 (Product 인터페이스를 대체)
interface OrderItem {
  no: string
  prod_code: string
  prod_name: string
  prod_spec: string
  prod_unit: string
  op_qty: number // 초기값 100에 맞춰 number 타입으로 설정
}

// 주문서관리-주문서상세정보 input 인터페이스
interface OrderInfoInterface {
  ord_id: string // 주문서번호
  ord_name: string // 주문서명
  bcnc_name: string // 거래처명
  pic: string // 대표자
  ord_date: string // 주문일자
  due_date: string // 납기일자
  emp_name: string // 사원이름, 주문서작성담당자
}

// props 정의
defineProps<Props>()

// 선택된 제품들
const selectedProducts = ref<OrderItem[]>([])
// products ref에 OrderItem[] 타입을 명시적으로 지정
const products = ref<OrderItem[]>([])
// 주문서조회검색 input태그 데이터 초기화
const search = ref<SearchCondition>({
  ord_name: '',
  due_start_date: '',
  due_end_date: '',
  ord_start_date: '',
  ord_end_date: '',
})
// 주문서상세정보 iunput태그 데이터 초기화
const orderinfo = ref<OrderInfoInterface>({
  ord_id: '', // 주문서번호
  ord_name: '', // 주문서명
  bcnc_name: '', // 거래처명
  pic: '', // 대표자
  ord_date: '', // 주문일자
  due_date: '', // 납기일자
  emp_name: '', // 사원이름, 주문서작성담당자
})

// 페이지 타이틀
const currentPageTitle = ref('주문서관리')
// 모달창 열고 닫을 수 있음
const BcncnameModal = ref(false)
const BcncnameOpenmodal = () => {
  BcncnameModal.value = true
}
const BcncnameClosemodal = () => {
  BcncnameModal.value = false
}
// pdf모달창 열고 닫기
const pdfModalOpen = ref(false)
const pdfopenModal = () => {
  if (!orderinfo.value.ord_id) {
    alert('주문서 등록 후 PDF 내보내기 가능합니다.')
    return
  }
  console.log('dbOrder :', dbOrderProducts.value, '/ products.value :  ', products.value)
  if (!isEqual(dbOrderProducts.value, products.value)) {
    alert('주문서 수정 저장 후 PDF 내보내기가 가능합니다.')
    return
  }
  if (!isEqual(dbOrderDetailInfo.value, orderinfo.value)) {
    alert('주문서 수정 저장 후 PDF 내보내기가 가능합니다.')
    return
  }
  pdfModalOpen.value = true
}
const pdfcloseModal = () => {
  pdfModalOpen.value = false
}

// 공통 날짜 설정
const flatpickrConfig = {
  dateFormat: 'Y-m-d', // 변수에 저장되는 데이터 형식
  altInput: false,
  wrap: true,
  locale: Korean,
}

// 주문일자 시작일 설정 (종료일이 있다면 maxDate 설정)
const ordStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: search.value.ord_end_date || 'today',
  locale: Korean,
}))

// 주문일자 종료일 설정 (시작일이 있다면 minDate 설정)
const ordEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최소 날짜로 설정하여 범위를 제한
  minDate: search.value.ord_start_date || undefined, // 시작일 없으면 minDate 설정 안함
  maxDate: 'today',
  locale: Korean,
}))

// 납기일자 시작일 설정
const dueStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 종료일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  maxDate: search.value.due_end_date,
  locale: Korean,
}))

// 납기일자 종료일 설정
const dueEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  // 시작일이 설정되어 있으면 해당 날짜를 최대 날짜로 설정하여 범위를 제한
  minDate: search.value.due_start_date,
  locale: Korean,
}))

// 주문서 조회 검색 버튼 누르면 실행하는 함수
const submitSearchForm = () => {
  console.log(search.value)
  // 컴포넌트가 마운트될 때 주문서조회 데이터 가져오기
  getOrderFormSearch()
}
// 주문서 조회 검색해서 나온 데이터(초기값) 담은 전역변수
const dbOrderDetailInfo = ref()
const dbOrderProducts = ref([])
// 주문서 조회 검색 버튼 눌렀을때 주문서정보 데이터를 노드에서 가져오는 함수
const getOrderFormSearch = async () => {
  try {
    const result = await axios.get('/api/ordFormManageView', {
      params: search.value,
    })
    const payload = result.data
    if (!payload) {
      alert('조회 결과가 없습니다.')
      resetInfoForm()
      return
    }
    dbOrderDetailInfo.value = result.data.list[0]
    dbOrderProducts.value = result.data.list1
    orderinfo.value = { ...result.data.list[0] }
    products.value = [...result.data.list1]
    console.log('db조회 주문서상세정보 결과:', dbOrderDetailInfo.value)
    console.log('db조회 주문제품 결과:', dbOrderProducts.value)
    console.log('products조회 결과:', products.value)
    console.log('orderinfo조회 결과:', orderinfo.value)
  } catch (err) {
    console.error('조회 중 오류 발생', err)
  }
}

// 주문서 정보 저장버튼 누르면 실행하는 함수
const submitInfoForm = () => {
  if (!orderinfo.value.due_date) {
    alert('납기날짜를 선택해주세요.')
    return
  }
  // console.log(orderinfo.value)
  // console.log(products.value)
}

// 주문서 조회 검색에 있는 초기화 버튼 누르면 실행되는 함수
const resetSearchForm = () => {
  search.value.ord_name = '' // v-model 값 초기화
  search.value.due_end_date = ''
  search.value.due_start_date = ''
  search.value.ord_end_date = ''
  search.value.ord_start_date = ''
}
// 주문서관리-주문서상세정보-초기화버튼(초기화 버튼 누르면 아래체 있는 값들이 초기화 상태로 바뀜)
const resetInfoForm = () => {
  orderinfo.value.bcnc_name = ''
  orderinfo.value.due_date = ''
  orderinfo.value.emp_name = ''
  orderinfo.value.ord_date = ''
  orderinfo.value.ord_id = ''
  orderinfo.value.ord_name = ''
  orderinfo.value.pic = ''
  products.value = []
  selectedProducts.value = []
}

// 거래처 선택하면 데이터 넘어오는 함수실행
const BcncSelect = (value: OrderInfoInterface) => {
  console.log(value.bcnc_name)
  orderinfo.value.bcnc_name = value.bcnc_name
  orderinfo.value.pic = value.pic
}

// 제품선택 모달창 열고 닫기
const productModalOpen = ref(false)
const ProductOpenmodal = () => {
  productModalOpen.value = true
}
const Productclosemodal = () => {
  productModalOpen.value = false
}
// 제품 선택하면 데이터 넘어오는 함수실행
const ProductSelect = (value: OrderItem[]) => {
  // console.log('선택된 제품:', value)
  value.forEach((item) => {
    const newNo = `${new Date().getTime()}_${item.prod_code}`
    products.value.push({
      no: newNo,
      prod_code: item.prod_code,
      prod_name: item.prod_name,
      prod_spec: item.prod_spec,
      prod_unit: item.prod_unit,
      op_qty: item.op_qty || 1,
    })
  })
  console.log('추가 후 products:', products.value)
  console.log('추가 후 db조회 주문서상세정보 결과:', dbOrderDetailInfo.value)
  console.log('추가 후 db조회 주문제품 결과:', dbOrderProducts.value)
}
// 행삭제 하면 선택한 제품들 삭제
const deleteSelectedRows = (sel: OrderItem[]) => {
  console.log('행삭제 선택한 제품들', sel)
  products.value = products.value.filter((item) => !sel.includes(item))
  sel.length = 0
  console.log('행 삭제 후 제품배열들', products.value)
  console.log('행 삭제 후 선택한제품들', sel)
  console.log('행 삭제 후 db조회 주문서상세정보 결과:', dbOrderDetailInfo.value)
  console.log('행 삭제 후 db조회 주문제품 결과:', dbOrderProducts.value)
}
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <form @submit.prevent="submitSearchForm" action="">
        <ComponentCard title="주문서상세조회검색">
          <template #header-right>
            <div class="">
              <button type="button" class="btn-white btn-common" @click="resetSearchForm">
                초기화
              </button>
              <button type="submit" class="btn-color btn-common">조회</button>
            </div>
          </template>
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서명*
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
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  주문날짜
                </label>
                <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ord_start_date"
                      :config="ordStartDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="시작일"
                      type="date"
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
                  <!-- 주문일자 종료일 -->
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="search.ord_end_date"
                      :config="ordEndDateConfig"
                      class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="종료일"
                      type="date"
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
            </div>
          </template>
        </ComponentCard>
      </form>
    </div>
    <form action="" id="submitinfoform" @submit.prevent="submitInfoForm">
      <div class="space-y-5 sm:space-y-6 mt-2">
        <ComponentCard title="주문서상세정보">
          <template #header-right>
            <div class="">
              <button
                type="button"
                class="btn-color btn-common btn-common-pdf"
                @click="pdfopenModal"
              >
                PDF내보내기
              </button>
              <button type="button" class="btn-white btn-common" @click="resetInfoForm">
                초기화
              </button>
              <button type="submit" class="btn-color btn-common" form="submitinfoform">저장</button>
              <button type="button" class="btn-white btn-common">삭제</button>
            </div>
          </template>
          <template #body-content>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서번호
                </label>
                <input
                  type="text"
                  disabled
                  class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:shadow-focus-ring focus:outline-hidden focus:ring-0 disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15"
                  v-model="orderinfo.ord_id"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서명*
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="주문서이름을 입력해주세요"
                  v-model="orderinfo.ord_name"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  거래처명*
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="거래처명을 입력해주세요"
                  v-model="orderinfo.bcnc_name"
                  @focus="BcncnameOpenmodal"
                  required
                  readonly
                />
                <!-- selectedBcncValue << 요게 모달창에서 보낸 함수이름 -->
                <BcncnameSelectmodal
                  @selectedBcncValue="BcncSelect"
                  :visible="BcncnameModal"
                  @close="BcncnameClosemodal"
                />
                <!-- 거래처, 대표자 고르는 모달창 -->
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  대표자*
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder="대표자를 입력해주세요"
                  v-model="orderinfo.pic"
                  @click="BcncnameOpenmodal"
                  required
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문날짜
                </label>
                <div class="relative w-full">
                  <flat-pickr
                    :config="flatpickrConfig"
                    class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:shadow-focus-ring focus:outline-hidden focus:ring-0 disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15"
                    disabled
                    v-model="orderinfo.ord_date"
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  납기날짜*
                </label>
                <div class="relative w-full">
                  <flat-pickr
                    placeholder="납기날짜를 입력해주세요"
                    v-model="orderinfo.due_date"
                    :config="flatpickrConfig"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    v-bind="{ required: true }"
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서작성담당자
                </label>
                <input
                  type="text"
                  disabled
                  class="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:shadow-focus-ring focus:outline-hidden focus:ring-0 disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15"
                  placeholder=""
                  v-model="orderinfo.emp_name"
                />
                <!-- db에 넣을때 주문서작성담당자는 로그인 되어있는 사람이름으로 -->
              </div>
            </div>

            <pdfDownload
              :order-info="orderinfo"
              :products="products"
              :visible="pdfModalOpen"
              @close="pdfcloseModal"
            />
            <!-- 주문서 내보내는 pdf 모달창 -->
          </template>
        </ComponentCard>
      </div>
      <div class="space-y-5 sm:space-y-6 mt-2">
        <ComponentCard title="주문제품">
          <template #header-right>
            <div class="flex items-center">
              <button type="button" class="btn-color btn-common" @focus="ProductOpenmodal">
                행추가
              </button>
              <button
                type="button"
                class="btn-white btn-common"
                @click="() => deleteSelectedRows(selectedProducts)"
              >
                행삭제
              </button>
              <ProductSelectmodal
                @selectedProductValue="ProductSelect"
                :visible="productModalOpen"
                @close="Productclosemodal"
              />
            </div>
          </template>
          <template #body-content>
            <div ref="tableWrapper" class="order-table-wrapper h-70">
              <DataTable
                v-model:selection="selectedProducts"
                :value="products"
                dataKey="no"
                tableStyle="max-width: 100%;"
                class="fixed-data"
                showGridlines
                scrollable
                scrollHeight="250px"
                editMode="cell"
                size="small"
              >
                <Column selectionMode="multiple" headerStyle="width: 1%" field="no"></Column>

                <Column
                  field="prod_code"
                  header="제품코드"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  headerStyle="width: 20%"
                ></Column>
                <Column
                  field="prod_name"
                  header="제품명"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  headerStyle="width: 20%"
                ></Column>
                <Column
                  field="prod_spec"
                  header="규격"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                  headerStyle="width: 20%"
                ></Column>
                <Column
                  field="prod_unit"
                  header="단위"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  headerStyle="width: 20%"
                ></Column>
                <Column
                  field="op_qty"
                  header="수량"
                  style="text-align: right"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  headerStyle="width: 15%"
                >
                  <template #body="{ data }">
                    <InputNumber
                      v-model="data.op_qty"
                      :min="1"
                      size="small"
                      :inputStyle="{ textAlign: 'right' }"
                    />
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
.btn-common-pdf {
  width: 150px;
  padding: 8px 20px;
  border-radius: 8px;
  margin: 0 5px;
  transition: all 0.3s;
}
input {
  height: 40px; /* input 높이 */
  line-height: 40px; /* line-height를 input 높이와 같게 */
  padding: 0 10px; /* 좌우 패딩 */
}
</style>
