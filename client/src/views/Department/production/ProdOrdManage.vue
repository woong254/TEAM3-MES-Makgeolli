<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';

import { ref } from 'vue';

const currentPageTitle = ref('공정 실적 관리')
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
  </AdminLayout>
</template>