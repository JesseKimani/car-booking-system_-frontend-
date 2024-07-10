<template>
  <div class="fuel-view">
    <nav class="navbar">
      <h1>Fuel</h1>
      <button @click="openAddModal">Add Fuel Record</button>
    </nav>
    <div class="fuel-list">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Fuel Type</th>
            <th>Quantity</th>
            <th>Amount Paid</th>
            <th>Fueled At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ getFuelType(product.fuel_type) }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ product.amount_paid }}</td>
            <td>{{ (product.fueled_at) }}</td>
            <td>
              <button @click="openEditModal(product)">Update</button>
              <button @click="openDeleteModal(product)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="products && products.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Fuel Record</template>
      <template #body>
        <form @submit.prevent="addProduct">
          <div>
            <strong>Fuel Type: </strong>
            <select v-model="newProduct.fuel_type" required>
              <option v-for="fuel_type in fuel_types" :key="fuel_type.id" :value="fuel_type.id">{{ fuel_type.name }}</option>
            </select>
          </div>
          <div>
            <strong>Quantity(Ltr): </strong>
            <input v-model="newProduct.quantity" placeholder="Quantity" required>
          </div>
          <div>
            <strong>Amount Paid: </strong>
            <input v-model="newProduct.amount_paid" placeholder="Amount" required>
          </div>
          
          <div>
            <strong>Fueled At: </strong>
            <input v-model="newProduct.fueled_at" placeholder="Petrol Station" required>
          </div>
          <div>
            <strong>Fueling Date: </strong>
            <input v-model="newProduct.fueling_date" placeholder="Fueling Date" type="date" required>
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Fuel Record</template>
      <template #body>
        <form @submit.prevent="updateProduct">
          <div>
            <strong>Fuel Type: </strong>
            <select v-model="currentProduct.fuel_type" required>
              <option v-for="fuel_type in fuel_types" :key="fuel_type.id" :value="fuel_type.id">{{ fuel_type.name }}</option>
            </select>
          </div>
          <div>
            <strong>Quantity(Ltr): </strong>
            <input v-model="currentProduct.quantity" placeholder="Quantity">
          </div>
          <div>
            <strong>Amount Paid: </strong>
            <input v-model="currentProduct.amount_paid" placeholder="Amount">
          </div>
          
          <div>
            <strong>Fueled At: </strong>
            <input v-model="currentProduct.fueled_at" placeholder="Petrol Station">
          </div>
          <div>
            <strong>Fueling Date: </strong>
            <input v-model="currentProduct.fueling_date" placeholder="Fueling Date" type="date">
          </div>
          
          <br>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Record</template>
      <template #body>
        <p>Are you sure you want to delete this fuel record?</p>
        <button @click="deleteProduct">Yes</button>
        <button @click="closeDeleteModal">No</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Modal from '../../components/Modal.vue';
import { API_ENDPOINT } from '../../config';
import Compressor from 'compressorjs'

const products = ref([])
const fuel_types = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newProduct = ref({
  fuel_type: '',
  quantity: '',
  amount_paid: '',
  fueled_at: '',
  fueling_date: '',
})

const currentProduct = ref(null)
const productToDelete = ref(null)

const rowsPerPage = 10
const currentPage = ref(1)

const paginatedProducts = computed(() => {
  if (!products.value) return []
  const start = (currentPage.value - 1) * rowsPerPage
  return products.value.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  if (!products.value) return 1
  return Math.ceil(products.value.length / rowsPerPage)
})

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/inv_fuels`)
    products.value = response.data
  } catch (error) {
    console.error('Error fetching fuel records:', error)
  }
}

const fetchFuelTypes = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/fuel_types`);
    fuel_types.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const addProduct = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/inv_fuels`, newProduct.value)
    products.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding fuel record:', error)
  }
}

const openAddModal = () => {
  newProduct.value = {
    fuel_type: '',
    quantity: '',
    amount_paid: '',
    fueled_at: '',
    fueling_date: '',
  };
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const openEditModal = (product) => {
  currentProduct.value = { ...product }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updateProduct = async () => {
  try {
    const response = await axios.put(`${API_ENDPOINT}/inv_fuels/${currentProduct.value.id}`, currentProduct.value)
    const index = products.value.findIndex(c => c.id === currentProduct.value.id)
    products.value[index] = response.data
    closeEditModal()
  } catch (error) {
    console.error('Error updating product:', error)
  }
}

const openDeleteModal = (product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const deleteProduct = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/inv_fuels/${productToDelete.value.id}`)
    products.value = products.value.filter(c => c.id !== productToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting product:', error)
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

const getFuelType = (fuelType) => {
  const fuel_type = fuel_types.value.find(fuel_type => fuel_type.id === fuelType)
  return fuel_type ? fuel_type.name : 'Unknown'
}


onMounted(() => {
  fetchProducts()
  fetchFuelTypes()
})
</script>

<style scoped>
.fuel-view {
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

.fuel-list {
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

.product-thumbnail {
  max-width: 50px;
  max-height: 50px;
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
