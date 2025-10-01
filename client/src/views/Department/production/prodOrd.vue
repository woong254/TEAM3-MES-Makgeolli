<script setup lang="ts">
const currentPageTitle = '생산지시관리';
</script>

<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <!-- <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="발주서">
        <div class="flex justify-end space-x-2 mb-2">
          <Button size="sm" variant="outline"> 초기화 </Button>
          <Button size="sm" variant="outline"> 조회 </Button>
          <Button size="sm" variant="primary"> 등록/수정 </Button>
          <Button size="sm" variant="primary"> 삭제 </Button>
        </div>
        <AgGridVue
          class="ag-theme-alpine"
          domLayout="autoheight"
          :columnDefs="colDefs"
          :rowData="rowData"
          width="100%"
        />
      </ComponentCard>
    </div> -->
  </AdminLayout>
</template>