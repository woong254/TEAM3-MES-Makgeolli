<script setup>
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import flatPickr from 'vue-flatpickr-component'
import MatModal from './MatModal/MatModal.vue'
import PurModal from './MatModal/PurModal.vue'
import BcncModal from './MatModal/BcncModal.vue'
import sysdate from 'moment'
import axios from 'axios'
import 'flatpickr/dist/flatpickr.css'
import '@/assets/common.css'
import { ref, onMounted, computed } from 'vue'
import userDateUtils from '@/utils/useDates.js' // 날짜 유틸

const baseInputClass =
  'dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800'

const currentPageTitle = ref('발주관리')
const isPurModalOpen = ref(false)
const isMatModalOpen = ref(false)
const isBcncModalOpen = ref(false)
const selectMat = ref([])

// 현재 화면의 발주가 DB에 "존재하는지" 여부 (존재해야 삭제 버튼 노출)
const isExisting = ref(false)

const purChase = ref([
  {
    pur_date: sysdate().format('YYYY-MM-DD'),
    emp_name: '정지웅',
    receipt_date: null,
  },
])

const purChaseMat = ref([])

/** yyyy-MM-dd 로 통일 */
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

// ---- 필수값 검증/알림 ----
const requiredAlert = (msg) => {
  alert(msg)
  throw new Error('VALIDATION_STOP')
}
const validateBeforeSave = () => {
  const h = purChase.value[0]
  if (!h.pur_name || !h.pur_name.trim()) requiredAlert('발주서명을 입력하세요.')
  if (!h.bcnc_code) requiredAlert('매입처를 선택하세요.')

  const purDate = toYmd(h.pur_date)
  const rcptDate = toYmd(h.receipt_date)
  if (!purDate) requiredAlert('발주일자를 선택하세요.')
  if (!rcptDate) requiredAlert('입고요청일자를 선택하세요.')
  if (rcptDate < purDate) requiredAlert('입고요청일자는 발주일자 이후여야 합니다.')

  if (!purChaseMat.value.length) requiredAlert('발주자재를 한 행 이상 추가하세요.')
  for (const [i, r] of purChaseMat.value.entries()) {
    if (!r.mat_code) requiredAlert(`자재코드가 비었습니다. (행 ${i + 1})`)
    const qty = Number(r.pur_qty || 0)
    if (!Number.isFinite(qty) || qty < 1)
      requiredAlert(`발주수량은 1 이상이어야 합니다. (행 ${i + 1})`)
  }
}

// ---- 저장 ----
const saveBtn = async () => {
  let saved = false // ✅ 성공 여부 플래그
  try {
    validateBeforeSave()
    const h = purChase.value[0]
    const header = {
      pur_code: h.pur_code,
      emp_id: h.emp_id || 'EMP-001',
      bcnc_code: h.bcnc_code,
      pur_name: (h.pur_name || '').trim(),
      pur_date: toYmd(h.pur_date),
      receipt_date: toYmd(h.receipt_date),
      remark: (h.remark || '').trim() || null,
    }
    const lines = purChaseMat.value.map((r) => ({
      mat_code: r.mat_code,
      pur_qty: Math.max(1, Number(r.pur_qty || 0)),
      remark: (r.remark || '').trim() || null,
    }))

    const { data } = await axios.post('/api/pur/save', { header, lines })
    if (!data?.ok) {
      alert(`저장 실패: ${data?.message || ''}`)
      return
    }

    // ✅ 알림
    if (data.mode === 'create') alert('발주서가 등록되었습니다.')
    else if (data.mode === 'update') alert('발주서가 수정되었습니다.')
    else alert('저장되었습니다.')

    saved = true // ✅ 여기서만 true
  } catch (e) {
    if (e?.message === 'VALIDATION_STOP') return
    console.error(e)
    alert('저장 중 오류')
  } finally {
    if (saved) {
      await resetBtn() // ✅ 성공시에만 초기화
      isExisting.value = false
    }
  }
}

// ---- 모달 선택: 헤더/라인 로드 ----
const onSelectPur = async (selectedPur) => {
  try {
    const code = selectedPur.pur_code
    const [hRes, lRes] = await Promise.all([
      axios.get('/api/pur/header', { params: { pur_code: code } }),
      axios.get('/api/pur/lines', { params: { pur_code: code } }),
    ])

    const h = hRes.data || {}
    purChase.value = [
      {
        pur_code: h.pur_code,
        pur_name: h.pur_name,
        bcnc_code: h.bcnc_code,
        bcnc_name: h.bcnc_name,
        pur_date: toYmd(h.pur_date),
        receipt_date: toYmd(h.receipt_date),
        emp_id: h.emp_id,
        emp_name: h.emp_name,
        remark: h.remark || '',
      },
    ]

    purChaseMat.value = (lRes.data || []).map((r) => ({
      mat_code: r.mat_code,
      mat_name: r.mat_name,
      stock_qty: r.stock_qty,
      safe_stock: r.safe_stock,
      pur_qty: r.pur_qty,
      mat_spec: r.mat_spec,
      mat_unit: r.mat_unit,
      remark: r.remark || '',
    }))
    selectMat.value = []
    // 모달에서 가져온 건 DB에 존재하는 문서
    isExisting.value = true
  } catch (e) {
    console.error(e)
    alert('발주서 불러오기 중 오류가 발생했습니다.')
  }
}

const onSelectMat = (payload) => {
  const rows = Array.isArray(payload) ? payload : [payload]
  for (const r of rows) {
    if (!r?.mat_code) continue
    const exists = purChaseMat.value.some((item) => item.mat_code === r.mat_code)
    if (exists) continue
    purChaseMat.value.push({
      mat_code: r.mat_code,
      mat_name: r.mat_name,
      stock_qty: r.stock_qty,
      safe_stock: r.safe_stock,
      pur_qty: 1,
      mat_spec: r.mat_spec,
      mat_unit: r.mat_unit,
      remark: '',
    })
  }
}

const onSelectBcnc = (selectedBcnc) => {
  purChase.value[0].bcnc_code = selectedBcnc.bcnc_code
  purChase.value[0].bcnc_name = selectedBcnc.bcnc_name
}

// ---- 삭제 ----
const canDelete = computed(() => isExisting.value && !!purChase.value?.[0]?.pur_code)

const deleteBtn = async () => {
  const code = purChase.value?.[0]?.pur_code
  if (!code) return
  const ok = confirm(`[${code}] 발주서를 정말 삭제하시겠습니까?`)
  if (!ok) return

  try {
    const { data } = await axios.post('/api/pur/delete', { pur_code: code })
    if (data?.ok) {
      alert('삭제되었습니다.')
      // 삭제 완료 후 신규 작성 상태로 초기화
      await resetBtn()
      isExisting.value = false
    } else {
      alert('삭제 실패')
    }
  } catch (e) {
    console.error(e)
    alert('삭제 중 오류')
  }
}

// ---- 코드 생성/초기화 ----
const getPurCode = async () => {
  try {
    const response = await axios.get('/api/purManagement')
    return response.data.pur_code ?? 'PUR-001'
  } catch {
    return 'PUR-001'
  }
}

const resetBtn = async () => {
  const newCode = await getPurCode()
  const today = sysdate().format('YYYY-MM-DD')
  purChaseMat.value = []
  purChase.value = [
    {
      pur_code: newCode,
      pur_name: '',
      bcnc_name: '',
      pur_date: today,
      receipt_date: null,
      emp_name: purChase.value[0]?.emp_name || '',
      remark: '',
    },
  ]
  selectMat.value = []
  // 신규 코드이므로 삭제 버튼 숨김
  isExisting.value = false
}

/** flatpickr */
const flatpickrConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  altInputClass: `${baseInputClass}`,
  minDate: purChase.value[0]?.pur_date || sysdate().format('YYYY-MM-DD'),
}))

const deleteSelectedRows = () => {
  purChaseMat.value = purChaseMat.value.filter((item) => !selectMat.value.includes(item))
  selectMat.value = []
}
const handleCloseModal = () => {
  isPurModalOpen.value = false
  isMatModalOpen.value = false
  isBcncModalOpen.value = false
}

onMounted(async () => {
  const code = await getPurCode()
  purChase.value[0].pur_code = code
  // 새 코드로 시작 → 삭제 버튼 숨김
  isExisting.value = false
})
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="발주서">
        <template #header-right>
          <div class="flex justify-end space-x-2 mb-1">
            <button type="button" class="btn-white btn-common" @click="resetBtn()">초기화</button>
            <button type="button" class="btn-white btn-common" @click="isPurModalOpen = true">
              조회
            </button>
            <button type="button" class="btn-color btn-common" @click="saveBtn">등록/수정</button>
            <!-- 삭제 버튼: DB에 존재하는 건일 때만 노출 -->
            <button v-if="canDelete" type="button" class="btn-color btn-common" @click="deleteBtn">
              삭제
            </button>
          </div>
        </template>

        <template #body-content>
          <DataTable
            :value="purChase"
            showGridlines
            @cell-edit-complete="
              (e) => {
                purChase[e.rowIndex][e.field] = e.newValue
              }
            "
          >
            <DataCol
              field="pur_code"
              header="발주코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px"
            />

            <DataCol
              field="pur_name"
              header="발주서명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 200px; padding: 8px"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="text"
                  :class="baseInputClass"
                  placeholder="발주서명을 입력해주세요."
                />
              </template>
            </DataCol>

            <!-- 매입처명 + 돋보기 아이콘 -->
            <DataCol
              field="bcnc_name"
              header="매입처명"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 200px"
            >
              <template #body="{ data, field }">
                <div class="relative">
                  <input
                    v-model="data[field]"
                    type="text"
                    readonly
                    placeholder="매입처를 선택해주세요."
                    @click="isBcncModalOpen = true"
                    :class="[baseInputClass, 'pr-10']"
                  />
                  <span
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>

            <DataCol
              field="pur_date"
              header="발주일자"
              style="width: 160px; text-align: center"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />

            <!-- 입고요청일자 + 캘린더 아이콘 -->
            <DataCol
              field="receipt_date"
              header="입고요청일자"
              style="width: 180px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <div class="relative">
                  <flat-pickr
                    v-model="data[field]"
                    :config="flatpickrConfig"
                    placeholder="날짜를 선택해주세요."
                  />
                  <span
                    class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
                    aria-hidden="true"
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
                      />
                    </svg>
                  </span>
                </div>
              </template>
            </DataCol>

            <DataCol
              field="emp_name"
              header="담당자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 120px"
            />
            <DataCol
              field="remark"
              header="비고"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 300px; padding: 8px"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="text"
                  :class="baseInputClass"
                  placeholder="내용을 입력해주세요."
                />
              </template>
            </DataCol>
          </DataTable>
        </template>
      </ComponentCard>

      <ComponentCard title="발주자재" style="height: 500px">
        <template #header-right>
          <div class="flex justify-end space-x-2">
            <button type="button" class="btn-white btn-common" @click="isMatModalOpen = true">
              행추가
            </button>
            <button type="button" class="btn-color btn-common" @click="deleteSelectedRows">
              행삭제
            </button>
          </div>
        </template>
        <template #body-content>
          <DataTable
            :value="purChaseMat"
            v-model:selection="selectMat"
            showGridlines
            dataKey="mat_code"
            scrollable
            scrollHeight="350px"
          >
            <DataCol selectionMode="multiple" headerStyle="width: 37px" bodyStyle="width: 37px" />
            <DataCol
              field="mat_code"
              header="자재코드"
              style="width: 180px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_name"
              header="자재명"
              style="width: 200px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="stock_qty"
              header="재고"
              style="width: 180px; text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="safe_stock"
              header="안전재고"
              style="width: 180px; text-align: right"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="pur_qty"
              header="발주수량"
              style="width: 200px; padding: 8px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="number"
                  min="1"
                  style="text-align: right"
                  :class="baseInputClass"
                  placeholder="발주수량"
                />
              </template>
            </DataCol>
            <DataCol
              field="mat_spec"
              header="규격"
              style="width: 140px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="mat_unit"
              header="단위"
              style="width: 140px"
              :pt="{ columnHeaderContent: 'justify-center' }"
            />
            <DataCol
              field="remark"
              header="비고"
              :pt="{ columnHeaderContent: 'justify-center' }"
              style="width: 300px; padding: 8px"
            >
              <template #body="{ data, field }">
                <input
                  v-model="data[field]"
                  type="text"
                  :class="baseInputClass"
                  placeholder="내용을 입력해주세요."
                />
              </template>
            </DataCol>
          </DataTable>
        </template>
      </ComponentCard>
    </div>

    <!-- 모달들 -->
    <PurModal
      v-model="isPurModalOpen"
      @close="handleCloseModal"
      :blocked-codes="purChase[0]?.pur_code ? [purChase[0].pur_code] : []"
      @select="onSelectPur"
    />
    <MatModal
      v-model="isMatModalOpen"
      :blocked-codes="purChaseMat.map((r) => r.mat_code)"
      @close="handleCloseModal"
      @select="onSelectMat"
    />
    <BcncModal
      v-model="isBcncModalOpen"
      :blocked-codes="purChase[0]?.bcnc_code ? [purChase[0].bcnc_code] : []"
      :blocked-names="purChase[0]?.bcnc_name ? [purChase[0].bcnc_name] : []"
      @close="handleCloseModal"
      @select="onSelectBcnc"
    />
  </AdminLayout>
</template>

<style scoped></style>
