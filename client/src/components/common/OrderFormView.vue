<template>
  <div>
    <!-- The AG Grid component -->
    <ag-grid-vue
      style="width: 100%; height: 480px"
      class="ag-theme-alpine"
      :columnDefs="columnDefs"
      :rowData="rowData"
    >
    </ag-grid-vue>
  </div>
</template>

<script>
//
import { AgGridVue } from 'ag-grid-vue3'

export default {
  name: 'App',
  data() {
    return {
      columnDefs: null,
      rowData: null,
    }
  },

  components: {
    AgGridVue,
  },

  beforeMount() {
    this.columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }]

    this.rowData = [
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxter', price: 72000 },
    ]
  },
}
</script>

<style>
/*  */
</style>
