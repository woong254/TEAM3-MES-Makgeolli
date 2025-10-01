<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { ref, onMounted, watch } from 'vue'

import Button from '@/components/ui/Button.vue'

import '@/assets/common.css'

const products = ref()
const selectedProducts = ref([])
// const metaKey = ref(true);

interface Props {
  title: string
  className?: string
  desc?: string
}

defineProps<Props>()

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
  <div
    :class="[
      'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
    ]"
  >
    <!-- Card Header -->
    <div class="px-2 pt-2 pb-1 m-1">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-base font-medium text-gray-800 dark:text-white/90">
          {{ title }}
        </h3>
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
      </div>
      <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ desc }}
      </p>
    </div>
    <!-- Card Body -->
    <div class="card pt-2 px-4 pb-3 border-t border-gray-100 dark:border-gray-800 gap-4">
      <!-- <DataTable v-model:selection="selectedProducts" :value="products" dataKey="id" tableStyle="min-width: 50rem" showGridlines> -->
      <DataTable
        :value="products"
        tableStyle="min-width: 50rem"
        showGridlines
        scrollable
        scrollHeight="400px"
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
          header="사원명"
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
        <Column field="unit" header="단위" :pt="{ columnHeaderContent: 'justify-center' }"></Column>
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
    </div>
  </div>
</template>
