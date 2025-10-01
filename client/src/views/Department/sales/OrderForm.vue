<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCardButton.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { defineProps, ref, onMounted } from 'vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import '@/assets/common.css'
// import axios from 'axios';

interface Props {
  title: string
  className?: string
  desc?: string
}

defineProps<Props>()

// const date = ref(null)
const deliveryStartDates = ref(null)
const deliveryEndDates = ref(null)
const orderStartDates = ref(null)
const orderEndDates = ref(null)

const products = ref()
// const selectedProducts = ref([])

const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  wrap: true,
}

const currentPageTitle = ref('주문서조회')



const ProductService = {
  getProductData() {
    return [
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '2',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
      {
        id: '1',
        name: '생막걸리',
        empName: '홍길잠',
        bcncName: '예담',
        pic: '홍길동',
        dueDate: '2025-10-01',
        ordDate: '2025-10-01',
        prodCode: 'mk001',
        prodName: '생막걸리(750ml*20병)',
        spec: '750ml',
        unit: '병',
        qty: 100,
        status: '출고대기',
      },
    ]
  },
}

onMounted(() => {
  products.value = ProductService.getProductData()
  
})

// 체크박스 눌렀는지 확인하는 리턴용도 watch
// watch(selectedProducts, (newSelection) => {
//     console.log("=========================================");
//     console.log("✅ 체크박스가 눌렸습니다! (선택 목록 업데이트)");

//     if (newSelection.length > 0) {
//         // 새로 선택된 목록의 전체 객체 출력
//         console.log("새로 선택된 제품 목록 (전체 객체):", newSelection);

//         // 특정 정보(예: ID와 이름)만 추출하여 출력
//         const selectedInfo = newSelection.map(item => ({ id: item.id, name: item.name }));
//         console.log("선택된 제품 ID 및 이름:", selectedInfo);
//     } else {
//         console.log("모든 항목이 선택 해제되었습니다.");
//     }
//     console.log("=========================================");
// }, {
//     // deep: true는 배열 내부 객체의 속성 변화까지 감지할 때 필요하지만,
//     // 이 경우 v-model이 배열 전체를 새 배열로 대체하므로 보통 생략해도 잘 작동합니다.
// });
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="주문서조회검색">
        <template #header-right>
          <div class="">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-color btn-common">조회</button>
          </div>
        </template>
        <template #body-content>
          <form action="">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                />
                <div>
                  <label
                    class="mt-1.5 mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    납기일자
                  </label>
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div class="relative w-45">
                      <flat-pickr
                        v-model="deliveryStartDates"
                        :config="flatpickrConfig"
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
                        v-model="deliveryEndDates"
                        :config="flatpickrConfig"
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  거래처명
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                />
                <div>
                  <label
                    class="mt-1.5 mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    주문일자
                  </label>
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div class="relative w-45">
                      <flat-pickr
                        v-model="orderStartDates"
                        :config="flatpickrConfig"
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
                        v-model="orderEndDates"
                        :config="flatpickrConfig"
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  대표자
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  주문서작성담당자
                </label>
                <input
                  type="text"
                  class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  placeholder=""
                />
              </div>
            </div>
          </form>
        </template>
      </ComponentCard>
    </div>
    <div class="space-y-5 sm:space-y-6 mt-2">
      <ComponentCard title="주문서조회">
        <template #header-right>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-color"
              style="
                width: 150px;
                padding: 8px 20px;
                border-radius: 8px;
                margin: 0 5px;
                transition: all 0.3s;
              "
            >
              엑셀내보내기
            </button>
          </div>
        </template>
        <template #body-content>
          <!-- <DataTable v-model:selection="selectedProducts" :value="products" dataKey="id" tableStyle="min-width: 50rem" showGridlines> -->
          <DataTable
            :value="products"
            tableStyle="min-width: 50rem"
            showGridlines
            scrollable
            scrollHeight="300px"
          >
            <!-- <Column selectionMode="multiple" headerStyle="width: 3rem"></Column> -->
            <Column
              field="id"
              header="주문서번호"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="name"
              header="주문서명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="empName"
              header="주문서작성자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="bcncName"
              header="거래처"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="pic"
              header="대표자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="dueDate"
              header="납기일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            ></Column>
            <Column
              field="ordDate"
              header="주문일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            ></Column>
            <Column
              field="prodCode"
              header="제품코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="prodName"
              header="제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: right"
            ></Column>
            <Column
              field="unit"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="qty"
              header="수량"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: right"
            ></Column>
            <Column
              field="status"
              header="상태"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
          </DataTable>
        </template>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
