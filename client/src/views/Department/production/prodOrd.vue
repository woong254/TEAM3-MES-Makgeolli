<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import ComponentCard from '@/components/common/ComponentCard.vue';
import '@/assets/common.css'
import { ref } from 'vue'

const currentPageTitle = ref('생산지시관리');
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard
        title="기본사항"
        :class="[
          'shadow-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
        ]"
      >
        <template #header>
          <div class="flex justify-end space-x-2 mb-2">
            <button type="button" class="btn-white btn-common">초기화</button>
            <button type="button" class="btn-white btn-common">조회</button>
            <button type="button" class="btn-color btn-common">등록/수정</button>
            <button type="button" class="btn-color btn-common">삭제</button>
          </div>
        </template>
        <template #body>

        </template>
      </ComponentCard>
    </div>
    
  </AdminLayout>
</template>