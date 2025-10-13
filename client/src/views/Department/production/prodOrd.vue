<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import ComponentCard from '@/components/common/ComponentCardButton.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import '@/assets/common.css';
import { ref, computed } from 'vue';

// 달력 import
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Korean } from 'flatpickr/dist/l10n/ko.js';

// 상품 모달
import ProductSelectmodal from '../sales/ProductSelectmodal.vue' // 제품선택

// node 연결
import axios from 'axios'

// props 인터페이스
interface Props {
  title: string
  className?: string
  desc?: string
};

// 지시서-기본정보
interface MakeInfo {
  make_code: string       // 지시코드
  make_name: string       // 생산지시명
  emp_name: string        // 지시담당자
  make_start_date: string // 생산 시작일
  make_end_date: string   // 생산 종료일
  remake: string          // 비고
};

// 지시서-상세정보(상품)
interface MakeItem {
  no: string            // 등록순서
  prod_code: string     // 제품코드
  prod_name: string     // 제품명
  prod_spec: string     // 제품규격
  prod_unit: string     // 관리단위
  make_qty: number      // 생산 수량, 초기값 100에 맞춰 number 타입으로 설정
  make_priority: number // 우선순위
  remark: string        // 비고
};

defineProps<Props>();

const selectProducts = ref<MakeItem[]>([]);
const products = ref<MakeItem[]>([]);

// 지시서 기본정보 초기화
const makeInfo = ref<MakeInfo>({
  make_code: '',
  make_name: '',
  emp_name: '',
  make_start_date: '', 
  make_end_date: '',
  remake: '',
});

// 생산 시작일 설정
const makeStartDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  maxDate: makeInfo.value.make_end_date,
  locale: Korean,
}));

// 생산 종료일 설정
const makeEndDateConfig = computed(() => ({
  dateFormat: 'Y-m-d',
  altInput: false,
  wrap: true,
  minDate: makeInfo.value.make_start_date ,
  locale: Korean,
}));

// 생산 지시 상세 - 상품 추가 모달
const productModal = ref(false);
const productModalOpen = () => {
  productModal.value = true;
}
const productModalClose= () => {
  productModal.value = false;
}


// 제품 선택하면 데이터 넘어오는 함수실행
const ProductSelect = (value: MakeItem[]) => {
  // console.log('선택된 제품:', value)
  value.forEach((item) => {
    const newNo = `${new Date().getTime()}_${item.prod_code}`
    products.value.push({
      no: newNo,
      prod_code: item.prod_code,
      prod_name: item.prod_name,
      prod_spec: item.prod_spec,
      prod_unit: item.prod_unit,
      make_qty: item.make_qty || 1,
      make_priority: item.make_priority,
      remark: item.remark ?? '',
    })
  })
  productModal.value = false;
}

// 행삭제 하면 선택한 제품들 삭제
const deleteSelectedRows = (prod: MakeItem[]) => {
  console.log('행삭제 선택한 제품들', prod)
  products.value = products.value.filter((item) => !prod.includes(item))  
  prod.length = 0
}

// 초기화
const resetInfo = () => {
  makeInfo.value.make_code = ''
  makeInfo.value.make_name = ''
  makeInfo.value.emp_name = ''
  makeInfo.value.make_start_date = ''
  makeInfo.value.make_end_date = ''
  makeInfo.value.remake = ''
  products.value = []
  selectProducts.value = []
}

// 저장 전 상세정보 정리
const beforeSubmit = () => 
  products.value.map((p, idx) => ({
    no: String(idx + 1),
    prod_code: p.prod_code,
    mk_num: Number(p.make_qty),
    mk_priority: p.make_priority,
    remark: p.remark ?? null,
  }))

// 저장 버튼 클릭시 실행 함수
const submitMakeInfo = async () => {
  if (products.value.length > 0 && products.value.some(p => !p.make_priority)) {
    alert('우선순위를 입력하지 않은 제품이 있습니다. 확인해주세요.');
    return;
  }
  console.log('유효성 검사 통과. 저장을 진행합니다.');
  
  const header = {
    make_name: makeInfo.value.make_name,
    mk_bgnde: makeInfo.value.make_start_date,
    mk_ende: makeInfo.value.make_end_date,
    writing_date: new Date().toISOString().slice(0, 10),
    remake: makeInfo.value.remake ?? null,
    emp_name: "EMP-20250616-0002",
  };
  const details = beforeSubmit();

  await axios.post('/api/prodOrd', { header, details }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

const currentPageTitle = ref('생산 지시 관리');

// 입력 정보 템플릿 스타일
const inputStyle = "dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
const inputBlackStyle = "dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:shadow-focus-ring focus:outline-hidden focus:ring-0 disabled:border-gray-100 disabled:bg-gray-50 disabled:placeholder:text-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:border-gray-800 dark:disabled:bg-white/[0.03] dark:disabled:placeholder:text-white/15";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2";
const baseInputClass = "dark:bg-dark-900 h-8 w-full rounded-lg border border-gray-300 bg-transparent pl-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <form action="" id="submitMakeInfo" @submit.prevent="submitMakeInfo">
      <div class="space-y-5 sm:space-y-6">
        <ComponentCard
        title="기본사항"
        :class="[
          'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
        ]"
        >
        <!-- 생산 지시 기본 정보 -->
        <template #header-right>
          <div class="flex justify-end">
            <button type="button" class="btn-white btn-common" style="width: auto;">계획서 불러오기</button>
            <button type="button" class="btn-white btn-common">지시 목록</button>
            <button type="button" class="btn-white btn-common" @click="resetInfo">초기화</button>
            <button type="button" class="btn-color btn-common">등록/수정</button>
            <button type="button" class="btn-white btn-common">삭제</button>
          </div>
        </template>
        <template #body-content>
          <div class="flex gap-4 mb-1.5">
            <div class="flex-1">
              <label :class="labelStyle">
                생산지시코드
              </label>
              <input
              type="text"
              disabled
              :class="inputBlackStyle"
              v-model="makeInfo.make_code"
              required
              />
            </div>
            <div class="flex-1">
              <label :class="labelStyle">
                생산지시명
              </label>
              <input
              type="text"
              :class="inputStyle"
              v-model="makeInfo.make_name"
              />
            </div>
            <div class="flex-1">
              <label :class="labelStyle">
                지시담당자
              </label>
              <input
              type="text"
              disabled
              :class="inputBlackStyle"
              v-model="makeInfo.emp_name"
              required
              />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative" style="min-width:260px;">
              <label :class="labelStyle">
                생산일자
              </label>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div class="relative w-45">
                  <flat-pickr
                  v-model="makeInfo.make_start_date"
                  :config="makeStartDateConfig"
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
                  <div class="relative w-45">
                    <flat-pickr
                      v-model="makeInfo.make_end_date"
                      :config="makeEndDateConfig"
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
              <div class="remark-box">
                <label :class="labelStyle">
                  비고
                </label>
                <input
                  type="text"
                  :class="inputStyle"
                  v-model="makeInfo.remake"
                />
              </div>
            </div>
          </template>
        </ComponentCard>
        <div class="space-y-5 sm:space-y-6 mt-2">
          <ComponentCard
            title="지시할 제품"
            :class="[
              'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
            ]"
          >
            <!-- 생산 지시 상세정보 -->
            <template #header-right>
              <div class="flex justify-end">
                <button type="button" class="btn-color btn-common" @focus="productModalOpen">제품추가</button>
                <button type="button" class="btn-white btn-common" @click="() => deleteSelectedRows(selectProducts)">제품삭제</button>
                <ProductSelectmodal
                  @selectedProductValue="ProductSelect"
                  :visible="productModal"
                  @close="productModalClose"
                />
              </div>
            </template>
            <template #body-content>
              <div class="card h-70">
                <DataTable 
                  :value="products"
                  v-model:selection="selectProducts"
                  data-key="no"
                  tableStyle="max-width: 100%;"
                  class="fixed-data"
                  showGridlines
                  scrollable
                  scrollHeight="280px"
                  editMode="cell"
                  size="small"
                  :rows="10"
                >
                  <Column selectionMode="multiple" headerStyle="width: 1%" />
                  <Column 
                    field="prod_code" 
                    header="제품코드" 
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 10%"
                  />
                  <Column 
                    field="prod_name" 
                    header="제품명" 
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    headerStyle="width: 15%"
                  />
                  <Column 
                    field="prod_spec" 
                    header="규격"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: right;"
                    headerStyle="width: 5%"
                  />
                  <Column 
                    field="prod_unit" 
                    header="단위"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: left;"
                    headerStyle="width: 5%"
                  />
                  <Column
                    field="make_qty" 
                    header="생산수량"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: right"
                    headerStyle="width: 7%"
                  >
                    <template #body="{ data }">
                      <input
                        v-model="data.make_qty"
                        type="number"
                        min="1"
                        :class="baseInputClass"
                        :style="{ textAlign: 'right' }"
                        placeholder="생산수량"
                      />
                    </template>
                  </Column>
                  <Column 
                    field="make_priority" 
                    header="우선순위" 
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: right"
                    headerStyle="width: 7%"
                  >
                    <template #body="{ data }">
                      <input
                        v-model="data.make_priority"
                        type="number"
                        :min="1"
                        :class="baseInputClass"
                        :style="{ textAlign: 'right' }"
                        style="height: 2rem"
                        placeholder="우선순위"
                      />
                    </template>
                  </Column>
                  <Column 
                    field="remark" 
                    header="비고"
                    :pt="{ columnHeaderContent: 'justify-center' }"
                    style="text-align: left"
                    headerStyle="width: 24%"
                  >
                    <template #body="{ data }">
                      <input
                        v-model="data.remark"
                        type="text"
                        :class="baseInputClass"
                        style="height: 2rem"
                        placeholder="내용을 입력해주세요."
                      />
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>
          </ComponentCard>
        </div>
      </div>
    </form>
    
  </AdminLayout>
</template>

<style>
.remark-box {
  width: 400px;
  min-width: 130px;
}

</style>