<template>
  <div class="expense-history">
    <nav class="navbar">
      <h1>Expenses</h1>
      <input v-model="searchQuery" @input="filterExpenses" placeholder="Search expenses...">
      <button @click="openAddModal">Add Expense</button>
    </nav>
    <div class="expense-list">
      <table>
        <thead>
          <tr>
            <th>Expense Type</th>
            <th>Asset Id</th>
            <th>Amount</th>
            <th>Action Date</th>
            <th>Client Id</th>
            <th>Company</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in paginatedExpenses" :key="expense.id">
            <td>{{ expense.expense_type }}</td>
            <td>{{ getAssetId(expense.asset_id) }}</td>
            <td>{{ expense.amount }}</td>
            <td>{{ formatDate(expense.action_date) }}</td>
            <td>{{ getClientId(expense.client_id) }}</td>
            <td>{{ expense.company_id }}</td>
            <td>{{ expense.description }}</td>
            <td>
              <button @click="openViewModal(expense)">View</button>
              <button @click="openEditModal(expense)">Update</button>
              <button @click="openDeleteModal(expense)">Delete</button>
            </td>
          </tr>
        </tbody>

      </table>
      <div v-if="expense.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Expense</template>
      <template #body>
        <form @submit.prevent="addExpense">
          <div>
            <strong>Expense Type: </strong>
            <input v-model="newExpense.expense_type" placeholder="Expense Type" required>
          </div>
          <div>
            <strong>Asset Id: </strong>
            <select v-model="newExpense.asset_id" required>
              <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
          </div>
          <div>
            <strong>Amount </strong>
            <input v-model="newExpense.amount" placeholder="Amount" required>
          </div>
          <div>
            <strong>Action Date: </strong>
            <input v-model="newExpense.action_date" type="date" placeholder="Action Date" required>
          </div>
          <div>
            <strong>Client Id: </strong>
            <select v-model="newExpense.client_id" required>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.first_name }} {{ client.last_name }}
                </option>
              </select>
          </div>
          <div>
            <strong>Company: </strong>
            <input v-model="newExpense.company_id" placeholder="Company" required>
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="newExpense.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Expense</template>
      <template #body>
        <form @submit.prevent="updateExpense">
          <div>
            <strong>Expense Type: </strong>
            <input v-model="currentExpense.expense_type" placeholder="Expense Type" required>
          </div>
          <div>
            <strong>Asset Id: </strong>
            <select v-model="currentExpense.asset_id" required>
              <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
          </div>
          <div>
            <strong>Amount </strong>
            <input v-model="currentExpense.amount" placeholder="Amount" required>
          </div>
          <div>
            <strong>Action Date: </strong>
            <input v-model="currentExpense.action_date" type="date" placeholder="Action Date" required>
          </div>
          <div>
            <strong>Client Id: </strong>
            <select v-model="currentExpense.client_id" required>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.first_name }} {{ client.last_name }}
                </option>
              </select>
          </div>
          <div>
            <strong>Company: </strong>
            <input v-model="currentExpense.company_id" placeholder="Company" required>
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="currentExpense.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>Expense Details</template>
      <template #body>
        <div v-if="currentExpense">
          <p><strong>Expense Type:</strong> {{ currentExpense.service_type }}</p>
          <p><strong>Asset Id:</strong> {{ getAssetId(currentExpense.asset_id) }}</p>
          <p><strong>Amount:</strong> {{ currentExpense.amount }}</p>
          <p><strong>Action Date:</strong> {{ formatDate(currentExpense.action_date) }}</p>
          <p><strong>Client Id:</strong> {{ getClientId(currentExpense.client_id) }}</p>
          <p><strong>Company:</strong> {{ currentExpense.company_id }}</p>
          <p><strong>Description:</strong> {{ currentExpense.description }}</p>
        </div>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete History</template>
      <template #body>
        <p>Are you sure you want to delete this expense record ?</p>
        <button @click="deleteExpense">Yes</button>
        <button @click="closeDeleteModal">No</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Modal from '../../components/Modal.vue'
import { API_ENDPOINT } from '../../config'

const expense = ref([])
const assets = ref([])
const clients = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)

const newExpense = ref({
  expense_type: '',
  asset_id: '',
  amount: '',
  action_date: '',
  client_id: '',
  company_id: '',
  description: ''
})

const currentExpense = ref(null)
const expenseToDelete = ref(null)

const searchQuery = ref("")
const rowsPerPage = 10
const currentPage = ref(1)

const paginatedExpenses = computed(() => {
  if (!expense.value) return []
  const filteredExpenses = expense.value.filter(exp => {
    return Object.values(exp).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  const start = (currentPage.value - 1) * rowsPerPage
  return filteredExpenses.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  if (!expense.value) return 1
  const filteredHistory = history.value.filter(hist => {
    return Object.values(hist).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  return Math.ceil(filteredExpenses.length / rowsPerPage)
})

const fetchExpenses = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/expenses`)
    expense.value = response.data
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

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

const addExpense = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/expenses`, newExpense.value)
    expense.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding expense:', error)
  }
}

const openAddModal = () => {
  newExpense.value = {
    expense_type: '',
    asset_id: '',
    amount: '',
    action_date: '',
    client_id: '',
    company_id: '',
    description: ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}


const openEditModal = (expense) => {
  currentExpense.value = { ...expense }
  showEditModal.value = true
}

const updateExpense = async () => {
  try {
    await axios.put(`${API_ENDPOINT}/expenses/${currentExpense.value.id}`, currentExpense.value)
    const index = expense.value.findIndex(h => h.id === currentExpense.value.id)
    expense.value.splice(index, 1, currentExpense.value)
    closeEditModal()
  } catch (error) {
    console.error('Error updating expense:', error)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const openDeleteModal = (expense) => {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

const deleteExpense = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/expenses/${expenseToDelete.value.id}`)
    const index = expense.value.findIndex(h => h.id === expenseToDelete.value.id)
    expense.value.splice(index, 1)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting expenses:', error)
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const openViewModal = (expense) => {
  currentExpense.value = { ...expense }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

const filterHistory = () => {
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

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


onMounted(() => {
  fetchExpenses()
  fetchAssets()
  fetchClients()
})
</script>

<style scoped>
.expense-history {
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

.navbar button {
  padding: 0.5rem 1rem;
}

.expense-list table {
  width: 100%;
  border-collapse: collapse;
}

.expense-list th, .expense-list td {
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
}

button {
  cursor: pointer;
  margin-left: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

form button {
  padding: 0.5rem 2rem;
}
</style>
  