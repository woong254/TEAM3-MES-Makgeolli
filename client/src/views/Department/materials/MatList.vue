<script setup>
/* ===== Imports ===== */
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import userDateUtils from '@/utils/useDates.js'
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import '@/assets/common.css'

/* ===== Page Title ===== */
const currentPageTitle = ref('자재 재고 조회')

/* ===== Styles ===== */
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'
const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'
const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

/* ===== Search form ===== */
const form = reactive({
  name: '', // mat_name
  type: '', // mat_item_code (a1=원자재, a2=부자재)
})

/* ===== Table Data ===== */
const rows = ref([])
const expanded = ref([])

/* ===== API ===== */
const fetchRows = async () => {
  try {
    const params = {}
    if (form.name?.trim()) params.mat_name = form.name.trim()
    if (form.type) params.mat_item_code = form.type

    const { data } = await axios.get('/api/mat/page', { params })
    rows.value = (data || []).map((r) => ({
      ...r,
      lots: [],
      _lotsLoaded: false,
    }))
    expanded.value = []
  } catch (e) {
    console.error('[mat/page] fetch error:', e)
    rows.value = []
    expanded.value = []
  }
}

const loadLots = async (mat_code) => {
  const { data } = await axios.get('/api/lot/matList', { params: { mat_code } })
  return (data || []).map((l) => ({
    mat_lot: l.mat_lot,
    prod_date: l.prod_date,
    exp_date: l.exp_date,
    stock_qty: Number(l.stock_qty || 0),
    receipt_qty: Number(l.receipt_qty || 0),
    release_qty: Number(l.release_qty || 0),
  }))
}

/* ===== Row Expansion: 펼칠 때 LOT 최초 1회만 로드 ===== */
const onRowExpand = async ({ data }) => {
  if (!data || data._lotsLoaded) return
  try {
    const lots = await loadLots(data.mat_code)
    data.lots = lots
    data._lotsLoaded = true
  } catch (err) {
    console.error('[lot/matList] fetch error:', err)
    data.lots = []
    data._lotsLoaded = true
  }
}

/* ===== Utils ===== */
const resetBtn = () => {
  form.name = ''
  form.type = ''
  fetchRows()
}
const n = (v) => {
  if (v == null) return ''
  return Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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

onMounted(fetchRows)
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-3">
      <!-- 검색 카드 -->
      <ComponentCard title="자재 검색">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common" @click="resetBtn">초기화</button>
            <button type="button" class="btn-color btn-common" @click="fetchRows">조회</button>
          </div>
        </template>
        <template #body-content>
          <div class="flex items-end gap-5 flex-wrap">
            <div class="w-72">
              <label :class="labelStyle">자재명</label>
              <input
                v-model="form.name"
                type="text"
                :class="inputStyle"
                placeholder="자재명을 입력"
                @keyup.enter="fetchRows"
              />
            </div>
            <div class="w-72">
              <label :class="labelStyle">자재유형</label>
              <div class="relative z-20 bg-transparent">
                <select v-model="form.type" :class="selectStyle">
                  <option value="">전체</option>
                  <option value="a1">원자재</option>
                  <option value="a2">부자재</option>
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
          </div>
        </template>
      </ComponentCard>

      <!-- 자재 목록 -->
      <ComponentCard title="자재 재고 목록" style="height: 561px">
        <template #body-content>
          <DataTable
            v-model:expandedRows="expanded"
            :value="rows"
            dataKey="mat_code"
            @rowExpand="onRowExpand"
            scrollable
            scrollHeight="431px"
            size="small"
            showGridlines
            :tableStyle="{ minWidth: '1200px' }"
          >
            <DataCol expander style="width: 50px" />

            <DataCol
              field="mat_code"
              header="자재코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_name"
              header="자재명"
              style="width: 260px"
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
              field="comncode_dtnm"
              header="자재유형"
              sortable
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_info"
              header="자재정보"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="stock_qty"
              header="재고"
              sortable
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data }">{{ n(data.stock_qty) }}</template>
            </DataCol>
            <DataCol
              field="safe_stock"
              header="안전재고"
              sortable
              style="text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data }">{{ n(data.safe_stock) }}</template>
            </DataCol>

            <!-- LOT 확장부 -->
            <template #expansion="{ data }">
              <DataTable
                :value="data.lots"
                size="small"
                showGridlines
                tableStyle="min-width: 800px"
              >
                <template #empty>
                  <div class="text-center">추가된 LOT자재가 없습니다.</div>
                </template>
                <DataCol
                  field="mat_lot"
                  header="자재LOT"
                  :pt="{ columnHeaderContent: 'justify-center' }"
                />
                <DataCol
                  field="prod_date"
                  header="제조일자"
                  sortable
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                >
                  <template #body="{ data: lot }">{{ toYmd(lot.prod_date) }}</template>
                </DataCol>
                <DataCol
                  field="exp_date"
                  header="유통기한"
                  sortable
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: center"
                >
                  <template #body="{ data: lot }">{{ toYmd(lot.exp_date) }}</template>
                </DataCol>
                <DataCol
                  field="release_qty"
                  header="출고수량"
                  sortable
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                >
                  <template #body="{ data: lot }">{{ n(lot.release_qty) }}</template>
                </DataCol>
                <DataCol
                  field="receipt_qty"
                  header="입고수량"
                  sortable
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                >
                  <template #body="{ data: lot }">{{ n(lot.receipt_qty) }}</template>
                </DataCol>
                <DataCol
                  field="stock_qty"
                  header="LOT재고"
                  sortable
                  :pt="{ columnHeaderContent: 'justify-center' }"
                  style="text-align: right"
                >
                  <template #body="{ data: lot }">{{ n(lot.stock_qty) }}</template>
                </DataCol>
              </DataTable>
            </template>
          </DataTable>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>
