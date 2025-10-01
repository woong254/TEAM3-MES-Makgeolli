<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
import Button from '@/components/ui/Button.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import DataTable from 'primevue/datatable'
import DataCol from 'primevue/column'
import { ref } from 'vue'

const currentPageTitle = ref('설비관리')
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle"> </PageBreadcrumb>
    <ComponentCard title="설비조회"> </ComponentCard>
  </AdminLayout>
</template>

<style scoped>
.container-box {
  background: white;
}
</style>
