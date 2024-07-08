<template>
    <div class="suppliers-view">
      <nav class="navbar">
        <h1>Suppliers</h1>
        <button @click="openAddModal">Add Supplier</button>
      </nav>
      <div class="supplier-list">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Category</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Location</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in paginatedSuppliers" :key="supplier.id">
              <td>{{ supplier.id }}</td>
              <td>{{ supplier.name }}</td>
              <td>{{ supplier.category }}</td>
              <td>{{ supplier.email }}</td>
              <td>{{ supplier.mobile }}</td>
              <td>{{ supplier.location }}</td>
              <td>{{ supplier.website }}</td>
              <td>
                <button @click="openEditModal(supplier)">Update</button>
                <button @click="openDeleteModal(supplier)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="suppliers && suppliers.length > rowsPerPage" class="pagination">
          <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
  
      <Modal v-if="showAddModal" @close="closeAddModal">
        <template #header>Add Supplier</template>
        <template #body>
          <form @submit.prevent="addSupplier">
            <input v-model="newSupplier.name" placeholder="Name" required>
            <input v-model="newSupplier.category" placeholder="Category" required>
            <input v-model="newSupplier.email" type="email" placeholder="Email" required>
            <input v-model="newSupplier.mobile" placeholder="Mobile" required>
            <input v-model="newSupplier.location" placeholder="Location" required>
            <input v-model="newSupplier.website" placeholder="Website" required>
            <button type="submit">Save</button>
          </form>
        </template>
      </Modal>
  
      <Modal v-if="showEditModal" @close="closeEditModal">
        <template #header>Update Supplier</template>
        <template #body>
          <form @submit.prevent="updateSupplier">
            <input v-model="currentSupplier.name" placeholder="Name" required>
            <input v-model="currentSupplier.category" placeholder="Category" required>
            <input v-model="currentSupplier.email" type="email" placeholder="Email" required>
            <input v-model="currentSupplier.mobile" placeholder="Mobile" required>
            <input v-model="currentSupplier.location" placeholder="Location" required>
            <input v-model="currentSupplier.website" placeholder="Website" required>

            <button type="submit">Update</button>
          </form>
        </template>
      </Modal>
  
      <Modal v-if="showDeleteModal" @close="closeDeleteModal">
        <template #header>Delete Supplier</template>
        <template #body>
          <p>Are you sure you want to delete this supplier?</p>
          <button @click="deleteSupplier">Yes</button>
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
  
  const suppliers = ref([])
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const newSupplier = ref({
    name: '',
    category: '',
    email: '',
    mobile: '',
    location: '',
    website: '',
  })
  const currentSupplier = ref(null)
  const supplierToDelete = ref(null)
  
  const rowsPerPage = 10
  const currentPage = ref(1)
  
  const paginatedSuppliers = computed(() => {
    if (!suppliers.value) return []
    const start = (currentPage.value - 1) * rowsPerPage
    return suppliers.value.slice(start, start + rowsPerPage)
  })
  
  const totalPages = computed(() => {
    if (!suppliers.value) return 1
    return Math.ceil(suppliers.value.length / rowsPerPage)
  })
  
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/supplier_vendors`)
      suppliers.value = response.data
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }
  
  const addSupplier = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/supplier_vendors`, newSupplier.value)
      suppliers.value.push(response.data)
      closeAddModal()
    } catch (error) {
      console.error('Error adding supplier:', error)
    }
  }
  
  const openAddModal = () => {
    showAddModal.value = true
  }
  
  const closeAddModal = () => {
    showAddModal.value = false
  }
  
  const openEditModal = (supplier) => {
    currentSupplier.value = { ...supplier }
    showEditModal.value = true
  }
  
  const closeEditModal = () => {
    showEditModal.value = false
  }
  
  const updateSupplier = async () => {
    try {
      const response = await axios.put(`${API_ENDPOINT}/supplier_vendors/${currentSupplier.value.id}`, currentSupplier.value)
      const index = suppliers.value.findIndex(c => c.id === currentSupplier.value.id)
      suppliers.value[index] = response.data
      closeEditModal()
    } catch (error) {
      console.error('Error updating suppliers:', error)
    }
  }
  
  const openDeleteModal = (supplier) => {
    supplierToDelete.value = supplier
    showDeleteModal.value = true
  }
  
  const closeDeleteModal = () => {
    showDeleteModal.value = false
  }
  
  const deleteSupplier = async () => {
    try {
      await axios.delete(`${API_ENDPOINT}/supplier_vendors/${supplierToDelete.value.id}`)
      suppliers.value = suppliers.value.filter(c => c.id !== supplierToDelete.value.id)
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting supplier:', error)
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
    fetchSuppliers()
  })
  </script>
  
  <style scoped>
  .suppliers-view{
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
  
  .supplier-list {
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
  