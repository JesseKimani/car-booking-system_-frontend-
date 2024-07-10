<template>
  <div>
    <h1>Car Rental Reports</h1>
    <div class="filters">
      <el-radio-group v-model="size" aria-label="size control">
        <el-radio-button value="large">large</el-radio-button>
        <el-radio-button value="default">default</el-radio-button>
        <el-radio-button value="small">small</el-radio-button>
      </el-radio-group>
      <div class="demo-date-picker">
        <div class="block">
          <span class="demonstration">Default</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :size="size"
          />
        </div>
        <div class="block">
          <span class="demonstration">With quick options</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            unlink-panels
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="shortcuts"
            :size="size"
          />
        </div>
      </div>

      <el-select v-model="selectedAssets" placeholder="Select Asset" multiple>
        <el-option
          v-for="asset in assets"
          :key="asset.id"
          :label="asset.reg_no"
          :value="asset.id"
        ></el-option>
      </el-select>

      <el-select v-model="selectedClients" placeholder="Select Client" multiple>
        <el-option
          v-for="client in clients"
          :key="client.id"
          :label="client.first_name"
          :value="client.id"
        ></el-option>
      </el-select>

      <el-button type="primary" @click="generateReport">Generate Report</el-button>
    </div>

    <el-table :data="reports" style="width: 100%">
      <el-table-column prop="id" label="ID" width="50"></el-table-column>
      <el-table-column prop="client_email" label="Client Email"></el-table-column>
      <el-table-column prop="client_company_id" label="Client Company ID"></el-table-column>
      <el-table-column prop="driver_name" label="Driver Name"></el-table-column>
      <el-table-column prop="from_address" label="From Address"></el-table-column>
      <el-table-column prop="to_address" label="To Address"></el-table-column>
      <el-table-column prop="start_date" label="Start Date"></el-table-column>
      <el-table-column prop="end_date" label="End Date"></el-table-column>
      <el-table-column prop="amount" label="Amount"></el-table-column>
      <el-table-column prop="description" label="Description"></el-table-column>
    </el-table>

    <el-pagination
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-size="15"
      layout="prev, pager, next"
      :total="totalReports"
    ></el-pagination>

    <div class="download-buttons">
      <el-button type="primary" @click="downloadPDF">Download PDF</el-button>
      <el-button type="primary" @click="downloadExcel">Download Excel</el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { export_json_to_excel } from '../../utils/excel';
import { API_ENDPOINT } from '../../config';
import {
  ref,
} from 'vue'
import {
  ElDatePicker,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElRadioGroup,
  ElRadioButton
} from 'element-plus';

export default {
  components: {
    ElDatePicker,
    ElSelect,
    ElOption,
    ElButton,
    ElTable,
    ElTableColumn,
    ElPagination,
    ElRadioGroup,
    ElRadioButton
  },
  setup() {
    const size = ref('default')
    const dateRange = ref([])
    const selectedAssets = ref([])
    const selectedClients = ref([])
    const assets = ref([])
    const clients = ref([])
    const reports = ref([])
    const currentPage = ref(1)
    const totalReports = ref(0)
    const totalAmount = ref(0)

    const shortcuts = [
      {
        text: 'Last week',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        },
      },
      {
        text: 'Last month',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        },
      },
      {
        text: 'Last 3 months',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        },
      },
    ]

    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/assets`);
        assets.value = response.data;
      } catch (error) {
        console.error('Failed to fetch assets', error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/cust_clients`);
        clients.value = response.data;
      } catch (error) {
        console.error('Failed to fetch clients', error);
      }
    };

    const generateReport = async () => {
      console.log('generateReport called');
      console.log('Date Range:', dateRange.value);
      console.log('Selected Assets:', selectedAssets.value);
      console.log('Selected Clients:', selectedClients.value);

      if (dateRange.value.length < 2) {
        this.$message.error('Please select a valid date range');
        return;
      }

      const params = {
        start_date: dateRange.value[0],
        end_date: dateRange.value[1],
        asset_ids: selectedAssets.value.join(',') || null,
        client_ids: selectedClients.value.join(',') || null,
        page: currentPage.value,
        pageSize: 15,
      };

      try {
        const response = await axios.get(`${API_ENDPOINT}/car_rental_reports`, { params });
        console.log('Report data:', response.data);
        reports.value = response.data.rows.sort((a, b) => new Date(a.action_date) - new Date(b.action_date));
        totalReports.value = response.data.count;
        totalAmount.value = reports.value.reduce((sum, report) => sum + parseFloat(report.amount), 0);
      } catch (error) {
        console.error('Error generating report:', error);
        this.$message.error('Failed to generate report');
      }
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      generateReport();
    };

    const downloadPDF = () => {
      const doc = new jsPDF();
      doc.autoTable({
        head: [['ID', 'Client Email', 'Client Company ID', 'Driver Name', 'From Address', 'To Address', 'Start Date', 'End Date', 'Amount', 'Description']],
        body: reports.value.map(report => [
          report.id,
          report.client_email,
          report.client_company_id,
          report.driver_name,
          report.from_address,
          report.to_address,
          report.start_date,
          report.end_date,
          report.amount,
          report.description,
        ]),
      });
      doc.save('car-rental-report.pdf');
    };

    const downloadExcel = () => {
      const data = reports.value.map(report => [
        report.id,
        report.client_email,
        report.client_company_id,
        report.driver_name,
        report.from_address,
        report.to_address,
        report.start_date,
        report.end_date,
        report.amount,
        report.description,
      ]);
      export_json_to_excel(
        ['ID', 'Client Email', 'Client Company ID', 'Driver Name', 'From Address', 'To Address', 'Start Date', 'End Date', 'Amount', 'Description'],
        data,
        'car-rental-report'
      );
    };

    fetchAssets();
    fetchClients();

    return {
      size,
      dateRange,
      selectedAssets,
      selectedClients,
      assets,
      clients,
      reports,
      currentPage,
      totalReports,
      totalAmount,
      shortcuts,
      fetchAssets,
      fetchClients,
      generateReport,
      handlePageChange,
      downloadPDF,
      downloadExcel
    };
  },
};
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters > * {
  margin-right: 10px;
  margin-bottom: 10px;
}
.download-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.download-buttons > * {
  margin-left: 10px;
}
.el-date-picker,
.el-select {
  width: 50%;

  max-width: 200px;
}
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}

.demo-date-picker .block:last-child {
  border-right: none;
}

.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
