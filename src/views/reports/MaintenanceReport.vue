<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-date-picker v-model="startDate" type="date" placeholder="Start Date" />
      </el-col>
      <el-col :span="8">
        <el-date-picker v-model="endDate" type="date" placeholder="End Date" />
      </el-col>
      <el-col :span="8">
        <el-select v-model="selectedAssets" multiple placeholder="Select Asset" class="custom-select">
          <el-option
            v-for="asset in assets"
            :key="asset.id"
            :label="asset.name"
            :value="asset.id"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-button type="primary" @click="generateReport" class="generate-button">Generate Report</el-button>

    <el-table v-if="showReport" :data="filteredReports" style="width: 100%">
      <el-table-column prop="asset_id" label="Asset Id" />
      <el-table-column prop="service_type" label="Service Type" />
      <el-table-column prop="done_by" label="Done By" />
      <el-table-column prop="date_in" label="Date In" />
      <el-table-column prop="date_out" label="Date Out" />
      <el-table-column prop="total_cost" label="Total Cost" />
      <el-table-column prop="description" label="Description" />
    </el-table>

    <el-pagination
      v-if="showReport"
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="totalReports"
      layout="prev, pager, next"
    />

    <el-button v-if="showReport" @click="downloadPDF">Download PDF</el-button>
    <el-button v-if="showReport" @click="downloadExcel">Download Excel</el-button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ElRow, ElCol, ElDatePicker, ElSelect, ElOption, ElTable, ElTableColumn, ElPagination, ElButton } from 'element-plus';
import { API_ENDPOINT } from '../../config';
import { export_json_to_excel } from '../../utils/excel';

export default {
  name: 'MaintenanceReport',
  components: {
    ElRow,
    ElCol,
    ElDatePicker,
    ElSelect,
    ElOption,
    ElTable,
    ElTableColumn,
    ElPagination,
    ElButton,
  },
  setup() {
    const startDate = ref(null);
    const endDate = ref(null);
    const selectedAssets = ref([]);
    const assets = ref([]);
    const reports = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const showReport = ref(false);

    const fetchAssets = async () => {
      const response = await axios.get(`${API_ENDPOINT}/assets`);
      assets.value = response.data;
    };

    const fetchReports = async () => {
      const response = await axios.get(`${API_ENDPOINT}/assets_services`);
      reports.value = response.data;
    };

    onMounted(() => {
      fetchAssets();
      fetchReports();
    });

    const filteredReports = computed(() => {
      return reports.value.filter(report => {
        const dateIn = new Date(report.date_in);
        const start = startDate.value ? new Date(startDate.value) : null;
        const end = endDate.value ? new Date(endDate.value) : null;
        const assetSelected = selectedAssets.value.length === 0 || selectedAssets.value.includes(report.asset_id);

        return (
          (!start || dateIn >= start) &&
          (!end || dateIn <= end) &&
          assetSelected
        );
      }).slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
    });

    const totalReports = computed(() => filteredReports.value.length);

    const handlePageChange = page => {
      currentPage.value = page;
    };

    const generateReport = () => {
      showReport.value = true;
    };

    const downloadPDF = () => {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Asset Id', 'Service Type', 'Done By', 'Date In', 'Date Out', 'Total Cost', 'Description']],
        body: filteredReports.value.map(report => [
          report.asset_id,
          report.service_type,
          report.done_by,
          report.date_in,
          report.date_out,
          report.total_cost,
          report.description,
        ]),
      });
      doc.save('maintenance_report.pdf');
    };

    const downloadExcel = () => {
      const headers = ['Asset Id', 'Service Type', 'Done By', 'Date In', 'Date Out', 'Total Cost', 'Description'];
      const data = filteredReports.value.map(report => [
        report.asset_id,
        report.service_type,
        report.done_by,
        report.date_in,
        report.date_out,
        report.total_cost,
        report.description,
      ]);
      export_json_to_excel(headers, data, 'maintenance_report');
    };

    return {
      startDate,
      endDate,
      selectedAssets,
      assets,
      reports,
      filteredReports,
      currentPage,
      pageSize,
      totalReports,
      showReport,
      handlePageChange,
      generateReport,
      downloadPDF,
      downloadExcel,
    };
  },
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.custom-select .el-select {
  width: 100%;
}
.generate-button {
  margin-top: 20px;
}
.el-table {
  margin-top: 20px;
}
.el-button {
  margin: 20px 10px 0 0;
}
</style>
