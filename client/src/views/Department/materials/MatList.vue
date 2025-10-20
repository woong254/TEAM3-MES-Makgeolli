<script setup>
/* ===== Imports ===== */
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import '@/assets/common.css'

/* ===== Page Title ===== */
const currentPageTitle = ref('자재 조회')

/* ===== Styles from your UI ===== */
const selectStyle =
  'dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const labelStyle = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400'

const inputStyle =
  'dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-950 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

/* ===== Search form ===== */
const form = reactive({
  name: '', // -> mat_name = ?
  type: '', // -> mat_item_code = ?  (a1: 원자재, a2: 부자재)
})

/* ===== Table data (SQL 컬럼과 동일 키 사용) ===== */
const rows = ref([])
const expanded = ref({})

/* ===== API ===== */
const fetchRows = async () => {
  try {
    const params = {}
    if (form.name?.trim()) params.mat_name = form.name.trim()
    if (form.type) params.mat_item_code = form.type

    // 서버 라우터: GET /api/mat/page
    const { data } = await axios.get('/api/mat/page', { params })
    rows.value = (data || []).map((r) => ({
      ...r,
      lots: r.lots ?? [],
    }))
  } catch (e) {
    console.error('[mat/page] fetch error:', e)
    rows.value = []
  }
}

/* ===== Handlers ===== */
const resetBtn = () => {
  form.name = ''
  form.type = ''
  fetchRows()
}
const onRowToggle = (e) => (expanded.value = e.value)
const n = (v) => (v == null ? '' : Number(v).toLocaleString())

onMounted(() => {
  fetchRows()
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-3">
      <!-- 검색 카드 -->
      <ComponentCard title="자재 검색">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-color btn-common" @click="resetBtn">초기화</button>
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

      <!-- 자재 목록 카드 -->
      <ComponentCard title="자재 목록" style="height: 561px">
        <template #body-content>
          <DataTable
            :value="rows"
            dataKey="mat_code"
            scrollable
            scrollHeight="431px"
            size="small"
            showGridlines
            :tableStyle="{ minWidth: '1200px' }"
            v-model:expandedRows="expanded"
            @rowToggle="onRowToggle"
          >
            <template #empty>
              <div class="text-center">등록한 자재가 없습니다.</div>
            </template>
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
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="text-align: right"
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

            <!-- 하위 LOT 테이블 -->
            <template #expansion="slotProps">
              <div v-if="(slotProps.data.lots || []).length" class="lot-wrap">
                <div class="lot-grid lot-head">
                  <div>LOT</div>
                  <div class="text-center">유통기한</div>
                  <div class="text-center">생산일자</div>
                  <div class="text-right">재고</div>
                  <div class="text-center">입/출고</div>
                </div>

                <div v-for="lot in slotProps.data.lots" :key="lot.lot" class="lot-grid lot-row">
                  <div>{{ lot.lot }}</div>
                  <div class="text-center">{{ lot.exp }}</div>
                  <div class="text-center">{{ lot.mfg }}</div>
                  <div class="text-right">{{ n(lot.stock) }}</div>
                  <div class="text-center">
                    <button class="lot-icon-btn" title="입/출고 조회">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M10 6h10M10 12h10M10 18h10M4 6h.01M4 12h.01M4 18h.01"
                          stroke="#374151"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="px-3 py-2 text-xs text-gray-500">
                LOT 정보가 없습니다. (별도 API 연동 시 노출)
              </div>
            </template>
          </DataTable>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped>
.lot-wrap {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  margin: 4px 0;
}
.lot-grid {
  display: grid;
  grid-template-columns: 2fr 1.6fr 1.6fr 1fr 0.8fr;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  color: #334155;
}
.lot-head {
  font-weight: 600;
  background: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
}
.lot-row {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
.lot-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  width: 28px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
}
.lot-icon-btn:hover {
  background: #eef2f7;
}
</style>
