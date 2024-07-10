<template>
  <div class="settings-table">
    <nav class="navbar">
      <h1>Positions</h1>
      <input v-model="searchQuery" @input="filterTable" placeholder="Search...">
      <button @click="openAddModal">Add Position</button>
    </nav>
    <div class="table-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedRows" :key="row.id">
            <td>{{ row.name }}</td>
            <td>{{ row.description }}</td>
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
      <template #header>Add Position</template>
      <template #body>
        <form @submit.prevent="addRow">
          <div>
            <strong>Name: </strong>
            <input v-model="newRow.name" placeholder="Name" required type="text">
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="newRow.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Position</template>
      <template #body>
        <form @submit.prevent="updateRow">
          <div>
            <strong>Name: </strong>
            <input v-model="currentRow.name" placeholder="Expense Type" required>
          </div>
          <div>
            <strong>Description: </strong>
            <input v-model="currentRow.description" placeholder="Description" type="text">
          </div>
          <br>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>Position Details</template>
      <template #body>
        <div v-if="currentRow">
          <p><strong>Name:</strong> {{ currentRow.name }}</p>
          <p><strong>Description:</strong> {{ currentRow.description }}</p>
        </div>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Position</template>
      <template #body>
        <p>Are you sure you want to delete this position?</p>
        <button @click="deleteRow">Yes</button>
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
  description: ''
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
    const response = await axios.get(`${API_ENDPOINT}/positions`)
    row.value = response.data
  } catch (error) {
    console.error('Error fetching positions:', error)
  }
}

const addRow = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/positions`, newRow.value)
    row.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding position:', error)
  }
}

const openAddModal = () => {
  newRow.value = {
    name: '',
    description: ''
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
    await axios.put(`${API_ENDPOINT}/positions/${currentRow.value.id}`, currentRow.value)
    const index = row.value.findIndex(h => h.id === currentRow.value.id)
    row.value.splice(index, 1, currentRow.value)
    closeEditModal()
  } catch (error) {
    console.error('Error updating position:', error)
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
    await axios.delete(`${API_ENDPOINT}/positions/${rowToDelete.value.id}`)
    const index = row.value.findIndex(h => h.id === rowToDelete.value.id)
    row.value.splice(index, 1)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting position:', error)
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
  