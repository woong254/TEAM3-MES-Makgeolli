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
import axios from 'axios'

interface Props {
  title: string
  className?: string
  desc?: string
}
interface SearchCondition {
  ord_name: string
  bcnc_name: string
  pic: string
  emp_name: string
  due_start_date: string
  due_end_date: string
  ord_start_date: string
  ord_end_date: string
}
interface Product {
  ord_id: string
  ord_name: string
  emp_name: string
  bcnc_name: string
  pic: string
  due_date: string
  ord_date: string
  prod_code: string
  prod_name: string
  prod_spec: string
  prod_unit: string
  op_qty: string
  order_status: string
}

defineProps<Props>()

// 날짜 변수 선언
// const deliveryStartDates = ref(null)
// const deliveryEndDates = ref(null)
// const orderStartDates = ref(null)
// const orderEndDates = ref(null)
const products = ref<Product>()
const flatpickrConfig = {
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'Y-m-d',
  wrap: true,
}

const currentPageTitle = ref('주문서조회')
const search = ref<SearchCondition>({
  ord_name: '',
  bcnc_name: '',
  pic: '',
  emp_name: '',
  due_start_date: '',
  due_end_date: '',
  ord_start_date: '',
  ord_end_date: '',
})

const getOrdersForms = async () => {
  const result = await axios
    .get<Product[]>('/api/ordFormView', { params: search.value })
    .catch((err) => console.log(err))

  products.value = result.data
}

onMounted(() => {
  getOrdersForms()
})
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
                  v-model="search.ord_name"
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
                        v-model="search.due_start_date"
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
                        v-model="search.due_end_date"
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
                        v-model="search.ord_start_date"
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
                        v-model="search.ord_end_date"
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
                  v-model="search.pic"
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
                  v-model="search.emp_name"
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
              field="ord_id"
              header="주문서번호"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="ord_name"
              header="주문서명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="emp_name"
              header="주문서작성자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="bcnc_name"
              header="거래처"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="pic"
              header="대표자"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="due_date"
              header="납기일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            ></Column>
            <Column
              field="ord_date"
              header="주문일자"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: center"
            ></Column>
            <Column
              field="prod_code"
              header="제품코드"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="prod_name"
              header="제품명"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="prod_spec"
              header="규격"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: right"
            ></Column>
            <Column
              field="prod_unit"
              header="단위"
              :pt="{ columnHeaderContent: 'justify-center' }"
            ></Column>
            <Column
              field="op_qty"
              header="수량"
              :pt="{ columnHeaderContent: 'justify-center' }"
              bodyStyle="text-align: right"
            ></Column>
            <Column
              field="order_status"
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
