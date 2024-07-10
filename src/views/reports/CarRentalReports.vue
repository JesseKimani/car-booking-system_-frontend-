<template>
  <div>
    <h1>Car Rental Reports</h1>
    <div class="filters">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="To"
        start-placeholder="Start date"
        end-placeholder="End date"
      ></el-date-picker>

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
  ElDatePicker,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
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
  },
  data() {
    return {
      dateRange: [],
      selectedAssets: [],
      selectedClients: [],
      assets: [],
      clients: [],
      reports: [],
      currentPage: 1,
      totalReports: 0,
      totalAmount: 0,
    };
  },
  methods: {
    async fetchAssets() {
      const response = await axios.get(`${API_ENDPOINT}/assets`);
      this.assets = response.data;
    },
    async fetchClients() {
      const response = await axios.get(`${API_ENDPOINT}/cust_clients`);
      this.clients = response.data;
    },
    async generateReport() {
      const params = {
        start_date: this.dateRange[0],
        end_date: this.dateRange[1],
        asset_ids: this.selectedAssets.join(','),
        client_ids: this.selectedClients.join(','),
        page: this.currentPage,
        pageSize: 15,
      };
      const response = await axios.get(`${API_ENDPOINT}/car_rental_reports`, { params });
      this.reports = response.data.rows.sort((a, b) => new Date(a.action_date) - new Date(b.action_date));
      this.totalReports = response.data.count;
      this.totalAmount = this.reports.reduce((sum, report) => sum + parseFloat(report.amount), 0);
      console.log("Report generated", this.reports);
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.generateReport();
    },
    downloadPDF() {
      const doc = new jsPDF();
      doc.autoTable({
        head: [['ID', 'Client Email', 'Client Company ID', 'Driver Name', 'From Address', 'To Address', 'Start Date', 'End Date', 'Amount', 'Description']],
        body: this.reports.map(report => [
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
    },
    downloadExcel() {
      const data = this.reports.map(report => [
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
    },
  },
  mounted() {
    this.fetchAssets();
    this.fetchClients();
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
</style>
