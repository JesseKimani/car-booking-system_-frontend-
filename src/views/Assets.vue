<template>
  <div class="assets-view">
    <nav class="navbar">
      <h1>Vehicles List</h1>
      <button @click="openAddModal">Add Asset</button>
    </nav>
    <div class="asset-list">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Reg. No.</th>
            <th>Make</th>
            <th>Model</th>
            <th>Year of Manufacture</th>
            <th>Region.</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in paginatedAssets" :key="asset.id">
            <td>{{ asset.id }}</td>
            <td>{{ asset.reg_no }}</td>
            <td>{{ asset.make }}</td>
            <td>{{ asset.model }}</td>
            <td>{{ asset.year_of_manufacture }}</td>
            <td>{{ asset.region }}</td>
            <td>
              <button @click="openEditModal(asset)">Update</button>
              <button @click="openDeleteModal(asset)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="assets && assets.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Asset</template>
      <template #body>
        <form @submit.prevent="addAsset">
          <input v-model="newAsset.reg_no" placeholder="Registration No." required>
          <input v-model="newAsset.make" placeholder="Make" required>
          <input v-model="newAsset.model" placeholder="Model" required>
          <input v-model="newAsset.year_of_manufacture" placeholder="Year of Manufacture" required>
          <input v-model="newAsset.buying_price" placeholder="Buying Price" required>
          <input v-model="newAsset.date_bought" placeholder="Date Bought" type="date" required>
          <input v-model="newAsset.region" placeholder="Region" required>
          <input v-model="newAsset.chasis_number" placeholder="Chasis Number" required>
          <input v-model="newAsset.current_mileage" placeholder="Current Mileage" required>
          <input v-model="newAsset.logbook_name" placeholder="Logbook Name" required>
          <input v-model="newAsset.is_active" type="checkbox"> Active
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Asset</template>
      <template #body>
        <form @submit.prevent="updateAsset">
          <input v-model="currentAsset.reg_no" placeholder="Registration No." required>
          <input v-model="currentAsset.make" placeholder="Make" required>
          <input v-model="currentAsset.model" placeholder="Model" required>
          <input v-model="currentAsset.year_of_manufacture" placeholder="Year of Manufacture" required>
          <input v-model="currentAsset.buying_price" placeholder="Buying Price" required>
          <input v-model="currentAsset.date_bought" placeholder="Date Bought" type="date" required>
          <input v-model="currentAsset.region" placeholder="Region" required>
          <input v-model="currentAsset.chasis_number" placeholder="Chasis Number" required>
          <input v-model="currentAsset.current_mileage" placeholder="Current Mileage" required>
          <input v-model="currentAsset.logbook_name" placeholder="Logbook Name" required>
          <input v-model="currentAsset.is_active" type="checkbox"> Active
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Asset</template>
      <template #body>
        <p>Are you sure you want to delete this asset?</p>
        <button @click="deleteAsset">Yes</button>
        <button @click="closeDeleteModal">No</button>
      </template>
    </Modal>
  </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Modal from '../components/Modal.vue'
import { API_ENDPOINT } from '../config'

const assets = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newAsset = ref({
  reg_no: '',
  make: '',
  model: '',
  year_of_manufacture: '',
  buying_price: '',
  date_bought: '',
  region: '',
  chasis_number: '',
  current_mileage: '',
  logbook_name: '',
  is_active: true
  })
const currentAsset = ref(null)
const assetToDelete = ref(null)

const rowsPerPage = 10
const currentPage = ref(1)

const paginatedAssets = computed(() => {
  if (!assets.value) return []
  const start = (currentPage.value - 1) * rowsPerPage
  return assets.value.slice(start, start + rowsPerPage)
  })

const totalPages = computed(() => {
if (!assets.value) return 1
return Math.ceil(assets.value.length / rowsPerPage)
})

const fetchAssets = async () => {
  try {
      const response = await axios.get(`${API_ENDPOINT}/assets`)
      assets.value = response.data
  } catch (error) {
      console.error('Error fetching assets:', error)
  }
  }

const addAsset = async () => {
  try {
      const response = await axios.post(`${API_ENDPOINT}/assets`, newAsset.value)
      assets.value.push(response.data)
      closeAddModal()
  } catch (error) {
      console.error('Error adding asset:', error)
  }
  }

const openAddModal = () => {
  newAsset.value = {
    reg_no: '',
    make: '',
    model: '',
    year_of_manufacture: '',
    buying_price: '',
    date_bought: '',
    region: '',
    chasis_number: '',
    current_mileage: '',
    logbook_name: '',
    is_active: true
    };
  showAddModal.value = true
  }

const closeAddModal = () => {
  showAddModal.value = false
  }

const openEditModal = (asset) => {
  currentAsset.value = { ...asset }
  showEditModal.value = true
  }

const closeEditModal = () => {
  showEditModal.value = false
  }

const updateAsset = async () => {
try {
  const response = await axios.put(`${API_ENDPOINT}/assets/${currentAsset.value.id}`, currentAsset.value)
  const index = assets.value.findIndex(c => c.id === currentAsset.value.id)
  assets.value[index] = response.data
  closeEditModal()
  } catch (error) {
    console.error('Error updating asset:', error)
  }
  }

const openDeleteModal = (asset) => {
  assetToDelete.value = asset
  showDeleteModal.value = true
  }

const closeDeleteModal = () => {
showDeleteModal.value = false
}

const deleteAsset = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/assets/${assetToDelete.value.id}`)
    assets.value = assets.value.filter(c => c.id !== assetToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting asset:', error)
  }
  }

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
  }

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
  }

onMounted(() => {
  fetchAssets()
  })
</script>

<style scoped>
.assets-view {
padding: 1rem;
}

.navbar {
display: flex;
justify-content: space-between;
align-items: center;
background-color: #333;
color: #fff;
padding: 1rem;
position: sticky;
top: 0;
}

.asset-list {
margin-top: 1rem;
}

table {
width: 100%;
border-collapse: collapse;
}

th, td {
border: 1px solid #ddd;
padding: 8px;
}

th {
background-color: #f2f2f2;
text-align: left;
font-weight: bold;
}

.pagination {
display: flex;
justify-content: center;
margin-top: 1rem;
}

button {
margin-left: 1rem;
}
</style>
