<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <VueGoodTable title="Bar Chart 1"> <BarChartOne /> </VueGoodTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import BarChartOne from '@/components/charts/BarChart/BarChartOne.vue'
import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref } from 'vue'
const currentPageTitle = ref('입고관리')
</script>
