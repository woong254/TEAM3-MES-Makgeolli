<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import OrderFormSearch from '@/components/common/OrderFormSearch.vue'
import OrderFormView from '@/components/common/OrderFormView.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import { ref } from 'vue'

const currentPageTitle = ref('주문서조회')
</script>
<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-6">
      <OrderFormSearch title="주문서조회검색">
        <!---->
      </OrderFormSearch>
      <ComponentCard title="테스트">
        <template #header>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-color btn-common">조회</button>
          </div>
        </template>
        <template #body> </template>
      </ComponentCard>
    </div>
    <div class="space-y-5 sm:space-y-6 mt-2">
      <OrderFormView title="주문서조회">
        <template> </template>
      </OrderFormView>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
