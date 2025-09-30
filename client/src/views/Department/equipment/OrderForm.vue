<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <OrderFormCard title="주문서조회">
        <BarChartOne />
      </OrderFormCard>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import OrderFormCard from '@/components/common/OrderFormCard.vue'
import { ref } from 'vue'

const currentPageTitle = ref('주문서조회')
</script>
<style scoped></style>
