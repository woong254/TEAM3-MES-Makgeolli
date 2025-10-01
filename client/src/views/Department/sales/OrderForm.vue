<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import OrderFormSearch from '@/components/common/OrderFormSearch.vue'
import OrderFormView from '@/components/common/OrderFormView.vue'
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
    </div>
    <div class="space-y-5 sm:space-y-6 mt-2">
      <OrderFormView title="주문서조회"> </OrderFormView>
    </div>
  </AdminLayout>
</template>

<style scoped></style>
