<template>
  <div class="income-history">
    <nav class="navbar">
      <h1>Income</h1>
      <input v-model="searchQuery" @input="filterIncomes" placeholder="Search incomes...">
    </nav>
    <div class="income-list">
      <table>
        <thead>
          <tr>
            <th>Booking Type</th>
            <th>Client Id</th>
            <th>Asset Id</th>
            <th>Amount</th>
            <th>Action Date</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="income in sortedIncomes" :key="income.unique_key" :class="{'pending': income.payment_status === 'Pending', 'paid': income.payment_status === 'Paid'}">
            <td>{{ income.booking_type }}</td>
            <td>{{ getClientId(income.client_id) }}</td>
            <td>{{ getAssetId(income.asset_id) }}</td>
            <td>{{ income.amount }}</td>
            <td>{{ formatDate(income.action_date) }}</td>
            <td>{{ income.payment_status }}</td>
            <td>
              <button @click="openViewModal(income)">View</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>Income Details</template>
      <template #body>
        <div v-if="currentIncome">
          <p><strong>Booking Type:</strong> {{ currentIncome.booking_type }}</p>
          <p><strong>Client Id:</strong> {{ getClientId(currentIncome.client_id) }}</p>
          <p><strong>Asset Id:</strong> {{ getAssetId(currentIncome.asset_id) }}</p>
          <p><strong>Amount:</strong> {{ currentIncome.amount }}</p>
          <p><strong>Action Date:</strong> {{ formatDate(currentIncome.action_date) }}</p>
          <p><strong>Payment Status:</strong> {{ currentIncome.payment_status }}</p>
        </div>
        <button v-if="currentIncome.payment_status === 'Pending'" @click="markAsPaid">Mark as Paid</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Modal from '../../components/Modal.vue'
import { API_ENDPOINT } from '../../config'

const incomes = ref([])
const assets = ref([])
const clients = ref([])
const showViewModal = ref(false)
const currentIncome = ref(null)
const currentPage = ref(1);
const itemsPerPage = 10;

const searchQuery = ref("")

const fetchIncomes = async () => {
  try {
    const carRentals = await axios.get(`${API_ENDPOINT}/car_rentals`);
    const leases = await axios.get(`${API_ENDPOINT}/leases`);
    const transfers = await axios.get(`${API_ENDPOINT}/transfers`);
    const distributions = await axios.get(`${API_ENDPOINT}/distributions`);

    const allIncomes = [
      ...carRentals.data.map(rental => ({ ...rental, booking_type: 'CarRental' })),
      ...leases.data.map(lease => ({ ...lease, booking_type: 'Lease' })),
      ...transfers.data.map(transfer => ({ ...transfer, booking_type: 'Transfer' })),
      ...distributions.data.map(distribution => ({ ...distribution, booking_type: 'Distribution' })),
    ];

    const paymentStatuses = await Promise.all(
      allIncomes.map(async (income, index) => {
        try {
          const revenueResponse = await axios.get(`${API_ENDPOINT}/revenues/${income.id}`);
          console.log(`Fetched payment status for income ID ${income.id}: ${revenueResponse.data.payment_status || 'Pending'}`);
          return { 
            ...income, 
            payment_status: revenueResponse.data.payment_status || 'Pending',
            unique_key: `${income.id}-${income.booking_type}-${index}` // Generating a unique key
          };
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`No payment status found for income ID ${income.id}, setting to 'Pending'`);
            return { 
              ...income, 
              payment_status: 'Pending', 
              unique_key: `${income.id}-${income.booking_type}-${index}` // Generating a unique key
            };
          } else {
            console.error('Error fetching payment status:', error);
            return { 
              ...income, 
              payment_status: 'Error', 
              unique_key: `${income.id}-${income.booking_type}-${index}` // Generating a unique key
            }; // Indicate an error if payment status could not be fetched
          }
        }
      })
    );

    incomes.value = paymentStatuses;
  } catch (error) {
    console.error('Error fetching incomes:', error);
  }
};

const fetchAssets = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/assets`)
    assets.value = response.data
  } catch (error) {
    console.error('Error fetching assets:', error)
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/cust_clients`);
    clients.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const openViewModal = (income) => {
  currentIncome.value = { ...income }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

const markAsPaid = async () => {
  if (currentIncome.value) {
    try {
      // Check if the revenue data exists
      const existingRevenue = await axios.get(`${API_ENDPOINT}/revenues/${currentIncome.value.id}`);
      if (existingRevenue.data) {
        // If revenue exists, update the payment status
        await axios.put(`${API_ENDPOINT}/revenues/${currentIncome.value.id}`, {
          payment_status: 'Paid',
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If revenue data does not exist, create it
        await axios.post(`${API_ENDPOINT}/revenues`, {
          ...currentIncome.value,
          payment_status: 'Paid',
        });
      } else {
        console.error('Error checking revenue existence:', error);
        return;
      }
    }

    // Update the local data to reflect the change
    const index = incomes.value.findIndex(income => income.id === currentIncome.value.id);
    if (index !== -1) {
      incomes.value[index].payment_status = 'Paid';
    }

    console.log(`Marked income ID ${currentIncome.value.id} as Paid`);

    closeViewModal();
  }
};

const filterIncomes = () => {
  return incomes.value.filter(income => {
    return (
      income.booking_type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      getClientId(income.client_id).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      getAssetId(income.asset_id).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      String(income.amount).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      formatDate(income.action_date).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      income.payment_status.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
};

const sortedIncomes = computed(() => {
  const filtered = filterIncomes()
  return filtered.sort((a, b) => {
    if (a.payment_status === 'Pending' && b.payment_status === 'Paid') return -1
    if (a.payment_status === 'Paid' && b.payment_status === 'Pending') return 1
    return 0
  })
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getAssetId = (assetId) => {
  const asset = assets.value.find(a => a.id === assetId)
  return asset ? asset.reg_no : 'Unknown'
}

const getClientId = (clientId) => {
  const client = clients.value.find(client => client.id === clientId);
  return client ? `${client.first_name} ${client.last_name}` : 'Unknown';
};

// const paginatedIncome = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   return incomes.value.slice(start, end);
// });

// const totalPages = computed(() => Math.ceil(incomes.value.length / itemsPerPage));

// const nextPage = () => {
//   if (currentPage.value < totalPages.value) {
//     currentPage.value++;
//   }
// };

// const previousPage = () => {
//   if (currentPage.value > 1) {
//     currentPage.value--;
//   }
// };

onMounted(() => {
  fetchIncomes()
  fetchAssets()
  fetchClients()
})
</script>

<style scoped>
.income-history {
  padding: 1rem;
}

.navbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.navbar input {
  padding: 0.5rem;
}

.income-list table {
  width: 100%;
  border-collapse: collapse;
}

.income-list th, .income-list td {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.pending {
  background-color: #f9c2c2;
}

.paid {
  background-color: #c2f9c2;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

button {
  cursor: pointer;
  margin-left: 1rem;
}
</style>
