<template>
  <div class="service-history">
    <nav class="navbar">
      <h1>Vehicles Service History</h1>
      <input v-model="searchQuery" @input="filterHistory" placeholder="Search service...">
      <button @click="openAddModal">Add Service History</button>
    </nav>
    <div class="history-list">
      <table>
        <thead>
          <tr>
            <th>Asset Id</th>
            <th>Service Type</th>
            <th>Done By</th>
            <th>Date In</th>
            <th>Date Out</th>
            <th>Total Cost</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="history in paginatedHistory" :key="history.id">
            <td>{{ getAssetId(history.asset_id) }}</td>
            <td>{{ history.service_type }}</td>
            <td>{{ history.done_by }}</td>
            <td>{{ formatDate(history.date_in) }}</td>
            <td>{{ formatDate(history.date_out) }}</td>
            <td>{{ history.total_cost }}</td>
            <td>{{ history.description }}</td>
            <td>
              <button @click="openViewModal(history)">View</button>
              <button @click="openEditModal(history)">Update</button>
              <button @click="openDeleteModal(history)">Delete</button>
            </td>
          </tr>
        </tbody>

      </table>
      <div v-if="history.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Service Record</template>
      <template #body>
        <form @submit.prevent="addHistory">
          <div>
            <strong>Asset Id: </strong>
            <select v-model="newHistory.asset_id" required>
              <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
          </div>
          <div>
            <strong>Area Office: </strong>
            <input v-model="newHistory.area_office" placeholder="Area office" required>
          </div>
          <div>
            <strong>Service Type: </strong>
            <input v-model="newHistory.service_type" placeholder="Service Type" required>
          </div>
          <div>
            <strong>Done By: </strong>
            <input v-model="newHistory.done_by" placeholder="Garage Name" required>
          </div>
          <div>
            <strong>Date In: </strong>
            <input v-model="newHistory.date_in" type="date" placeholder="Date In" required>
          </div>
          <div>
            <strong>Date Out: </strong>
            <input v-model="newHistory.date_out" type="date" placeholder="Date Out" required>
          </div>
          <div>
            <strong>Invoice Number: </strong>
            <input v-model="newHistory.invoice_number" placeholder="Invoice Number" required>
          </div>
          <div>
            <strong>Total Cost: </strong>
            <input v-model="newHistory.total_cost" placeholder="Cost" required>
          </div>
          <div>
            <strong>Mileage: </strong>
            <input v-model="newHistory.mileage" placeholder="Mileage">
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="newHistory.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Service</template>
      <template #body>
        <form @submit.prevent="updateHistory">
          <div>
            <strong>Asset Id: </strong>
            <select v-model="currentHistory.asset_id">
              <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
          </div>
          <div>
            <strong>Area Office: </strong>
            <input v-model="currentHistory.area_office" placeholder="Area Office">
          </div>
          <div>
            <strong>Service Type: </strong>
            <input v-model="currentHistory.service_type" placeholder="Service Type" required>
          </div>
          <div>
            <strong>Done By: </strong>
            <input v-model="currentHistory.done_by" placeholder="Garage Name" required>
          </div>
          <div>
            <strong>Date In: </strong>
            <input v-model="currentHistory.date_in" type="date" placeholder="Date In" required>
          </div>
          <div>
            <strong>Date Out: </strong>
            <input v-model="currentHistory.date_out" type="date" placeholder="Date Out" required>
          </div>
          <div>
            <strong>Invoice Number: </strong>
            <input v-model="currentHistory.invoice_number" placeholder="Invoice Number">
          </div>
          <div>
            <strong>Total Cost: </strong>
            <input v-model="currentHistory.total_cost" placeholder="Cost" required>
          </div>
          <div>
            <strong>Mileage: </strong>
            <input v-model="currentHistory.mileage" placeholder="Mileage">
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="currentHistory.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>Service Details</template>
      <template #body>
        <div v-if="currentHistory">
          <p><strong>Asset Id:</strong> {{ getAssetId(currentHistory.asset_id) }}</p>
          <p><strong>Area Office:</strong> {{ currentHistory.area_office }}</p>
          <p><strong>Service Type:</strong> {{ currentHistory.service_type }}</p>
          <p><strong>Done By:</strong> {{ currentHistory.done_by }}</p>
          <p><strong>Date In:</strong> {{ formatDate(currentHistory.date_in) }}</p>
          <p><strong>Date Out:</strong> {{ formatDate(currentHistory.date_out) }}</p>
          <p><strong>Invoice Number:</strong> {{ currentHistory.invoice_number }}</p>
          <p><strong>Total Cost:</strong> {{ currentHistory.total_cost }}</p>
          <p><strong>Mileage:</strong> {{ currentHistory.mileage }}</p>
          <p><strong>Description:</strong> {{ currentHistory.description }}</p>
        </div>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete History</template>
      <template #body>
        <p>Are you sure you want to delete this service history?</p>
        <button @click="deleteHistory">Yes</button>
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

const history = ref([])
const assets = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)

const newHistory = ref({
  asset_id: '',
  area_office: '',
  service_type: '',
  done_by: '',
  date_in: '',
  date_out: '',
  invoice_number: '',
  total_cost: '',
  mileage: '',
  description: ''
})

const currentHistory = ref(null)
const historyToDelete = ref(null)

const searchQuery = ref("")
const rowsPerPage = 10
const currentPage = ref(1)

const paginatedHistory = computed(() => {
  if (!history.value) return []
  const filteredHistory = history.value.filter(hist => {
    return Object.values(hist).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  const start = (currentPage.value - 1) * rowsPerPage
  return filteredHistory.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  if (!history.value) return 1
  const filteredHistory = history.value.filter(hist => {
    return Object.values(hist).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  return Math.ceil(filteredHistory.length / rowsPerPage)
})

const fetchHistory = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/assets_services`)
    history.value = response.data
  } catch (error) {
    console.error('Error fetching history:', error)
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

const addHistory = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/assets_services`, newHistory.value)
    history.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding history:', error)
  }
}

const openAddModal = () => {
  newHistory.value = {
    asset_id: '',
    area_office: '',
    service_type: '',
    done_by: '',
    date_in: '',
    date_out: '',
    invoice_number: '',
    total_cost: '',
    mileage: '',
    description: ''
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}


const openEditModal = (history) => {
  currentHistory.value = { ...history }
  showEditModal.value = true
}

const updateHistory = async () => {
  try {
    await axios.put(`${API_ENDPOINT}/assets_services/${currentHistory.value.id}`, currentHistory.value)
    const index = history.value.findIndex(h => h.id === currentHistory.value.id)
    history.value.splice(index, 1, currentHistory.value)
    closeEditModal()
  } catch (error) {
    console.error('Error updating history:', error)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const openDeleteModal = (history) => {
  historyToDelete.value = history
  showDeleteModal.value = true
}

const deleteHistory = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/assets_services/${historyToDelete.value.id}`)
    const index = history.value.findIndex(h => h.id === historyToDelete.value.id)
    history.value.splice(index, 1)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting history:', error)
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const openViewModal = (history) => {
  currentHistory.value = { ...history }
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

onMounted(() => {
  fetchHistory()
  fetchAssets()
})
</script>

<style scoped>
.service-history {
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

.history-list table {
  width: 100%;
  border-collapse: collapse;
}

.history-list th, .history-list td {
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
/* 
form div {
  margin-bottom: 1rem;
} */

/* form strong {
  display: block;
  margin-bottom: 0.5rem;
}

form input, form select {
  padding: 0.5rem;
  width: 100%;
} */

form button {
  padding: 0.5rem 2rem;
}
</style>
  