<template>
  <div class="products-view">
    <nav class="navbar">
      <h1>Inventory</h1>
      <button @click="openAddModal">Add Product</button>
    </nav>
    <div class="product-list">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Supplied By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <img :src="product.product_image" alt="Product Image" class="product-thumbnail" v-if="product.product_image">
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>{{ product.quantity }}</td>
            <td>{{ getSupplierName(product.supplied_by) }}</td>
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
      <template #header>Add Product</template>
      <template #body>
        <form @submit.prevent="addProduct">
          <div>
            <strong>Image: </strong>
            <input type="file" @change="handleImageUpload($event, 'newProduct')" accept="image/*" required>
            <img :src="newProduct.product_image" v-if="newProduct.product_image" alt="Selected Image" class="product-thumbnail">
          </div>
          <div>
            <strong>Item Name: </strong>
            <input v-model="newProduct.name" placeholder="Name" required>
          </div>
          <div>
            <strong>Category: </strong>
            <input v-model="newProduct.category" placeholder="Category" required>
          </div>
          <div>
            <strong>Quantity: </strong>
            <input v-model="newProduct.quantity" placeholder="Quantity" required>
          </div>
          <div>
            <strong>Supplied By: </strong>
            <select v-model="newProduct.supplied_by" required>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option>
            </select>
          </div>
          <div>
            <strong>Date Introduced: </strong>
            <input v-model="newProduct.date_introduced" placeholder="Date Introduced" type="date" required>
          </div>
          <br>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Product</template>
      <template #body>
        <form @submit.prevent="updateProduct">
          <div>
            <strong>Image: </strong>
            <input type="file" @change="handleImageUpload($event, 'currentProduct')" accept="image/*" required>
            <img :src="currentProduct.product_image" v-if="currentProduct.product_image" alt="Selected Image" class="product-thumbnail">
          </div>
          <div>
            <strong>Item Name: </strong>
            <input v-model="currentProduct.name" placeholder="Name" required>
          </div>
          <div>
            <strong>Category: </strong>
            <input v-model="currentProduct.category" placeholder="Category" required>
          </div>
          <div>
            <strong>Quantity: </strong>
            <input v-model="currentProduct.quantity" placeholder="Quantity" required>
          </div>
          <div>
            <strong>Supplied By: </strong>
            <select v-model="currentProduct.supplied_by" required>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">{{ supplier.name }}</option>
            </select>
          </div>
          <div>
            <strong>Date Inroduced: </strong>
            <input v-model="currentProduct.date_introduced" placeholder="Date Introduced" type="date">
          </div>
          <br>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Item</template>
      <template #body>
        <p>Are you sure you want to delete this item?</p>
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
const suppliers = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newProduct = ref({
  product_image: '',
  name: '',
  category: '',
  quantity: '',
  supplied_by: '',
  date_introduced: '',
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
    const response = await axios.get(`${API_ENDPOINT}/inv_products`)
    products.value = response.data
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchSuppliers = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/supplier_vendors`)
    suppliers.value = response.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}


const handleImageUpload = (event, productType) => {
  const file = event.target.files[0];
  if (file) {
    new Compressor(file, {
      quality: 0.6,
      success(result) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (productType === 'newProduct') {
            newProduct.value.product_image = e.target.result;
          } else if (productType === 'currentProduct') {
            currentProduct.value.product_image = e.target.result;
          }
        };
        reader.readAsDataURL(result);
      },
      error(err) {
        console.error(err.message);
      },
    });
  }
};

const addProduct = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/inv_products`, newProduct.value)
    products.value.push(response.data)
    closeAddModal()
  } catch (error) {
    console.error('Error adding product:', error)
  }
}

const openAddModal = () => {
  newProduct.value = {
    product_image: '',
    name: '',
    category: '',
    quantity: '',
    supplied_by: '',
    date_introduced: '',
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
    const response = await axios.put(`${API_ENDPOINT}/inv_products/${currentProduct.value.id}`, currentProduct.value)
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
    await axios.delete(`${API_ENDPOINT}/inv_products/${productToDelete.value.id}`)
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

const getSupplierName = (supplierId) => {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  return supplier ? supplier.name : 'Unknown'
}

onMounted(() => {
  fetchProducts()
  fetchSuppliers()
})
</script>

<style scoped>
.products-view {
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

.product-list {
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
