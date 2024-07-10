<template>
  <div class="settings-table">
    <nav class="navbar">
      <h1>Area Offices</h1>
      <input v-model="searchQuery" @input="filterTable" placeholder="Search...">
      <button @click="openAddModal">Add Area Office/ Branch</button>
    </nav>
    <div class="table-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="row.id">
            <td>{{ row.name }}</td>
            <td>{{ row.city }}</td>
            <td>{{ row.email }}</td>
            <td>{{ row.phone }}</td>
            <td>{{ row.address }}</td>
            <td>
              <button @click="openViewModal(row)">View</button>
              <button @click="openEditModal(row)">Update</button>
              <button @click="openDeleteModal(row)">Delete</button>
            </td>
          </tr>
        </tbody>

      </table>
      <div v-if="row.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Area Office</template>
      <template #body>
        <form @submit.prevent="addRow">
          <div>
            <strong>Name: </strong>
            <input v-model="newRow.name" placeholder="Name" required type="text">
          </div>
          <div>
            <strong>City: </strong>
            <input v-model="newRow.city" placeholder="City" type="text">
          </div>
          <div>
            <strong>Email: </strong>
            <input v-model="newRow.email" placeholder="Email" required type="text">
          </div>
          <div>
            <strong>Phone: </strong>
            <input v-model="newRow.phone" placeholder="Phone" type="text">
          </div>
          <div>
            <strong>Address: </strong>
            <input v-model="newRow.address" placeholder="Address" type="text">
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Branch</template>
      <template #body>
        <form @submit.prevent="updateRow">
          <div>
            <strong>Name: </strong>
            <input v-model="currentRow.name" placeholder="Name" required>
          </div>
          <div>
            <strong>City: </strong>
            <input v-model="currentRow.city" placeholder="City" type="text">
          </div>
          <div>
            <strong>Email: </strong>
            <input v-model="currentRow.email" placeholder="Email" required>
          </div>
          <div>
            <strong>Phone: </strong>
            <input v-model="currentRow.phone" placeholder="phone" type="text">
          </div>
          <div>
            <strong>Address: </strong>
            <input v-model="currentRow.address" placeholder="Address" required>
          </div>
          <br>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>Office Details</template>
      <template #body>
        <div v-if="currentRow">
          <p><strong>Name:</strong> {{ currentRow.name }}</p>
          <p><strong>City:</strong> {{ currentRow.city }}</p>
          <p><strong>Email:</strong> {{ currentRow.email }}</p>
          <p><strong>Phone:</strong> {{ currentRow.phone }}</p>
          <p><strong>Address:</strong> {{ currentRow.address }}</p>
        </div>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Office</template>
      <template #body>
        <p>Are you sure you want to delete this branch?</p>
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

const row = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)

const newRow = ref({
  name: '',
  city: '',
  email: '',
  phone: '',
  address: ''
})

const currentRow = ref(null)
const rowToDelete = ref(null)

const searchQuery = ref("")
const rowsPerPage = 5
const currentPage = ref(1)

const paginatedRows = computed(() => {
  if (!row.value) return []
  const filteredRows = row.value.filter(hist => {
    return Object.values(hist).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  const start = (currentPage.value - 1) * rowsPerPage
  return filteredRows.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  if (!row.value) return 1
  const filteredRows = row.value.filter(hist => {
    return Object.values(hist).some(value => 
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  return Math.ceil(filteredRows.length / rowsPerPage)
})

const fetchRows = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/area_offices`)
    row.value = response.data
  } catch (error) {
    console.error('Error fetching makes:', error)
  }
}

const addRow = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/area_offices`, newRow.value)
    row.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding makes:', error)
  }
}

const openAddModal = () => {
  newRow.value = {
    name: '',
    city: '',
    email: '',
    phone: '',
    address: ''
    }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const openEditModal = (row) => {
  currentRow.value = { ...row }
  showEditModal.value = true
}

const updateRow = async () => {
  try {
    await axios.put(`${API_ENDPOINT}/area_offices/${currentRow.value.id}`, currentRow.value)
    const index = row.value.findIndex(h => h.id === currentRow.value.id)
    row.value.splice(index, 1, currentRow.value)
    closeEditModal()
  } catch (error) {
    console.error('Error updating group:', error)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const openDeleteModal = (row) => {
  rowToDelete.value = row
  showDeleteModal.value = true
}

const deleteRow= async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/area_offices/${rowToDelete.value.id}`)
    const index = row.value.findIndex(h => h.id === rowToDelete.value.id)
    row.value.splice(index, 1)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting branch:', error)
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const openViewModal = (row) => {
  currentRow.value = { ...row }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
}

const filterTable = () => {
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


onMounted(() => {
  fetchRows()
})
</script>

<style scoped>
.settings-table {
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

.table-list table {
  width: 100%;
  border-collapse: collapse;
}

.table-list th, .table-list td {
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

form button {
  padding: 0.5rem 2rem;
}
</style>
  