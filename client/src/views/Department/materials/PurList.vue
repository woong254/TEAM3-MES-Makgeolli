<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { Korean } from 'flatpickr/dist/l10n/ko.js'
import axios from 'axios'
import '@/assets/common.css'
import userDateUtils from '@/utils/useDates.js'

// ✅ PDF 미리보기 모달 (페이지네이션 지원 버전)
import PurPdfModal from './MatModal/PurPdfModal.vue'

const currentPageTitle = ref('발주서조회')

const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const purSearch = reactive({
  pur_name: '',
  bcnc_name: '',
  start_pur: null,
  end_pur: null,
  receipt_status: '',
  start_receipt: null,
  end_receipt: null,
})

const selectPur = ref([]) // ✅ 여러 건 선택
const purList = ref([])
const loading = ref(false)

// ✅ 모달/문서 배열 (페이지네이션 소스)
const isPdfOpen = ref(false)
const pdfDocs = ref([]) // [{ headerInfo:{...}, items:[...] }]

// 선택한 발주서들로 모달 열기
const openPdfPreview = async () => {
  const rows = Array.isArray(selectPur.value) ? selectPur.value : []
  if (!rows.length) {
    alert('발주서를 한 건 이상 선택하세요.')
    return
  }
  try {
    // 여러 건 병렬 로딩
    const tasks = rows.map(async (row) => {
      const pur_code = row.pur_code
      const [hRes, lRes] = await Promise.all([
        axios.get('/api/pur/header', { params: { pur_code } }),
        axios.get('/api/pur/lines', { params: { pur_code } }),
      ])
      const h = hRes.data || {}
      const headerInfo = {
        pur_code: h.pur_code || '',
        pur_name: h.pur_name || '',
        bcnc_name: h.bcnc_name || '',
        emp_name: h.emp_name || '',
        pur_date: h.pur_date ? toYmd(h.pur_date) : '',
        receipt_date: h.receipt_date ? toYmd(h.receipt_date) : '',
        remark: h.remark || '',
      }
      const items = (Array.isArray(lRes.data) ? lRes.data : []).map((r) => ({
        mat_name: r.mat_name,
        mat_spec: r.mat_spec,
        mat_unit: r.mat_unit,
        pur_qty: r.pur_qty,
        pur_remark: r.remark || '',
      }))
      return { headerInfo, items }
    })

    pdfDocs.value = await Promise.all(tasks)
    isPdfOpen.value = true
  } catch (e) {
    console.error(e)
    alert('PDF 미리보기 데이터를 불러오는 중 오류가 발생했습니다.')
  }
}

const toYmd = (v) => {
  if (!v) return null
  try {
    return userDateUtils.dateFormat(v, 'yyyy-MM-dd')
  } catch {
    const d = new Date(v)
    if (isNaN(d)) return null
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
  }
}

const earlier = (a, b, c) => {
  const ab = a && b ? (a < b ? a : b) : a || b || null
  return ab && c ? (ab < c ? ab : c) : ab || c || null
}
const later = (a, b) => (a && b ? (a > b ? a : b) : a || b || null)

const startPur = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${inputStyle} text-center px-8`,
  maxDate: earlier(purSearch.end_pur, purSearch.end_receipt, purSearch.start_receipt),
  locale: Korean,
}))

const endPur = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${inputStyle} text-center px-8`,
  minDate: purSearch.start_pur || null,
  locale: Korean,
}))

const startReceipt = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${inputStyle} text-center px-8`,
  minDate: purSearch.start_pur || null,
  maxDate: purSearch.end_receipt || null,
  locale: Korean,
}))

const endReceipt = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${inputStyle} text-center px-8`,
  minDate: later(purSearch.start_pur, purSearch.start_receipt),
  locale: Korean,
}))

const fetchPurList = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/purchase/search', { params: purSearch })
    purList.value = Array.isArray(data)
      ? data.map((r) => ({
          ...r,
          pur_date: toYmd(r.pur_date),
          receipt_date: toYmd(r.receipt_date),
        }))
      : []
  } catch (e) {
    console.error(e)
    purList.value = []
  } finally {
    loading.value = false
  }
}

const resetBtn = () => {
  Object.assign(purSearch, {
    pur_name: '',
    bcnc_name: '',
    start_pur: null,
    end_pur: null,
    receipt_status: '',
    start_receipt: null,
    end_receipt: null,
  })
  fetchPurList()
}

onMounted(() => {
  fetchPurList()
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-3">
      <ComponentCard title="발주서 검색">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-color btn-common" @click="resetBtn">초기화</button>
            <button type="button" class="btn-color btn-common" @click="fetchPurList">조회</button>
          </div>
        </template>

        <template #body-content>
          <div class="flex flex-wrap gap-4">
            <div class="w-1/4">
              <label :class="labelStyle"> 발주서명 </label>
              <input type="text" :class="inputStyle" v-model="purSearch.pur_name" />
            </div>

            <div class="w-1/4">
              <label :class="labelStyle"> 매입처명 </label>
              <input type="text" :class="inputStyle" v-model="purSearch.bcnc_name" />
            </div>

            <div class="w-1/4">
              <label :class="labelStyle"> 입고상태 </label>
              <div class="relative z-20 bg-transparent">
                <select :class="selectStyle" v-model="purSearch.receipt_status">
                  <option value="">전체</option>
                  <option value="입고대기">입고대기</option>
                  <option value="부분입고">부분입고</option>
                  <option value="입고완료">입고완료</option>
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

            <div class="w-1/4">
              <label :class="labelStyle"> 발주일자 </label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <flat-pickr
                    v-model="purSearch.start_pur"
                    :config="startPur"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      />
                    </svg>
                  </span>
                </div>
                <div>-</div>
                <div class="relative">
                  <flat-pickr
                    v-model="purSearch.end_pur"
                    :config="endPur"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div class="w-1/4">
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                입고요청일자
              </label>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <flat-pickr
                    v-model="purSearch.start_receipt"
                    :config="startReceipt"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      />
                    </svg>
                  </span>
                </div>
                <div>-</div>
                <div class="relative">
                  <flat-pickr
                    v-model="purSearch.end_receipt"
                    :config="endReceipt"
                    class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ComponentCard>

      <ComponentCard title="발주서 목록" style="height: 475px">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button
              type="button"
              class="btn-color btn-common"
              style="width: 130px"
              @click="openPdfPreview"
            >
              PDF내보내기
            </button>
          </div>
        </template>

        <template #body-content>
          <DataTable
            showGridlines
            v-model:selection="selectPur"
            :value="purList"
            dataKey="pur_code"
            scrollable
            scrollHeight="345px"
            size="small"
          >
            <template #empty>
              <div class="text-center">등록한 발주서가 없습니다.</div>
            </template>

            <DataCol selectionMode="multiple" headerStyle="width: 37px" bodyStyle="width: 37px" />

            <DataCol
              field="pur_code"
              header="발주코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_name"
              header="발주서명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_date"
              header="발주일자"
              sortable
              style="text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="receipt_date"
              header="입고요청일자"
              style="text-align: center"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="emp_name"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_code"
              header="매입처코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="bcnc_name"
              header="매입처명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_code"
              header="자재코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_name"
              header="자재명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_unit"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_qty"
              header="발주수량"
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_status"
              header="입고상태"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="remark"
              header="발주서 비고"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_remark"
              header="발주자재 비고"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
          </DataTable>
        </template>
      </ComponentCard>
    </div>

    <!-- ✅ PDF 모달: 여러 건 페이지네이션 -->
    <PurPdfModal :visible="isPdfOpen" :docs="pdfDocs" @close="isPdfOpen = false" />
  </AdminLayout>
</template>
