<template>
  <div class="customers-view">
    <nav class="navbar">
      <h1>Registered Customers</h1>
      <button @click="openAddModal">Add Customer</button>
    </nav>
    <div class="customer-list">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in paginatedCustomers" :key="customer.id">
            <td>{{ customer.id }}</td>
            <td>{{ customer.first_name }} {{ customer.last_name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.company }}</td>
            <td>{{ customer.department }}</td>
            <td>
              <button @click="openEditModal(customer)">Update</button>
              <button @click="openDeleteModal(customer)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="customers && customers.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>Add Customer</template>
      <template #body>
        <form @submit.prevent="addCustomer">
          <input v-model="newCustomer.first_name" placeholder="First Name" required>
          <input v-model="newCustomer.last_name" placeholder="Last Name" required>
          <input v-model="newCustomer.email" type="email" placeholder="Email" required>
          <input v-model="newCustomer.password" type="password" placeholder="Password" required>
          <input v-model="newCustomer.address" placeholder="Address" required>
          <input v-model="newCustomer.phone" placeholder="Phone Number" required>
          <input v-model="newCustomer.company" placeholder="Company" required>
          <input v-model="newCustomer.department" placeholder="Department" required>
          <input v-model="newCustomer.is_active" type="checkbox"> Active
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Customer</template>
      <template #body>
        <form @submit.prevent="updateCustomer">
          <input v-model="currentCustomer.first_name" placeholder="First Name" required>
          <input v-model="currentCustomer.last_name" placeholder="Last Name" required>
          <input v-model="currentCustomer.email" placeholder="Email" required>
          <input v-model="currentCustomer.password" placeholder="Password" required>
          <input v-model="currentCustomer.address" placeholder="Address" required>
          <input v-model="currentCustomer.phone" placeholder="Phone" required>
          <input v-model="currentCustomer.company" placeholder="Company" required>
          <input v-model="currentCustomer.department" placeholder="Department" required>
          <input v-model="currentCustomer.is_active" type="checkbox"> Active
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Customer</template>
      <template #body>
        <p>Are you sure you want to delete this customer?</p>
        <button @click="deleteCustomer">Yes</button>
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

const customers = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newCustomer = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  address: '',
  phone: '',
  company: '',
  department: '',
  is_active: true
})
const currentCustomer = ref(null)
const customerToDelete = ref(null)

const rowsPerPage = 10
const currentPage = ref(1)

const paginatedCustomers = computed(() => {
  if (!customers.value) return []
  const start = (currentPage.value - 1) * rowsPerPage
  return customers.value.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
  if (!customers.value) return 1
  return Math.ceil(customers.value.length / rowsPerPage)
})

const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/cust_clients`)
    customers.value = response.data
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

const addCustomer = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/cust_clients`, newCustomer.value)
    customers.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding customer:', error)
  }
}

const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const openEditModal = (customer) => {
  currentCustomer.value = { ...customer }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const updateCustomer = async () => {
  try {
    const response = await axios.put(`${API_ENDPOINT}/cust_clients/${currentCustomer.value.id}`, currentCustomer.value)
    const index = customers.value.findIndex(c => c.id === currentCustomer.value.id)
    customers.value[index] = response.data
    closeEditModal()
  } catch (error) {
    console.error('Error updating customer:', error)
  }
}

const openDeleteModal = (customer) => {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const deleteCustomer = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/cust_clients/${customerToDelete.value.id}`)
    customers.value = customers.value.filter(c => c.id !== customerToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting customer:', error)
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
  fetchCustomers()
})
</script>

<style scoped>
.customers-view {
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

.customer-list {
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
