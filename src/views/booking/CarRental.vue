<template>
  <div class="car-rental">
    <h1>Car Rental Bookings</h1>
    <nav class="navbar">
      <button @click="openAddModal">New Booking</button>
    </nav>
    <div class="booking-list">
      <table>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Status</th>
            <th>Client ID</th>
            <th>Asset ID</th>
            <th>From Address</th>
            <th>To Address</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in paginatedBookings" :key="booking.id">
            <td class="action-buttons">
              <button @click="openViewModal(booking)">View</button>
              <button @click="openEditModal(booking)">Update</button>
              <button @click="openDeleteModal(booking)">Delete</button>
            </td>
            <td :class="statusClass(booking.status)">{{ booking.status }}</td>
            <td>{{ getClientName(booking.client_id) }}</td>
            <td>{{ getAssetRegNo(booking.asset_id) }}</td>
            <td>{{ booking.from_address }}</td>
            <td>{{ booking.to_address }}</td>
            <td>{{ formatDate(booking.start_date) }}</td>
            <td>{{ formatDate(booking.end_date) }}</td>
            <td>{{ booking.amount }}</td>
            <td>{{ booking.description }}</td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
      <template #header>New Booking</template>
      <template #body>
        <form @submit.prevent="addBooking">
          <div v-for="(field, index) in bookingFields" :key="index">
            <strong>{{ field.label }}: </strong>
            <template v-if="field.name === 'client_id'">
              <select v-model="newBooking.client_id" required>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.first_name }} {{ client.last_name }}
                </option>
              </select>
            </template>
            <template v-else-if="field.name === 'asset_id'">
              <select v-model="newBooking.asset_id" required>
                <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                  {{ asset.reg_no }}
                </option>
              </select>
            </template>
            <template v-else>
              <input v-model="newBooking[field.name]" :type="field.type" required />
            </template>
          </div>
          <button type="submit">Save</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
      <template #header>Update Booking</template>
      <template #body>
        <form @submit.prevent="updateBooking">
          <div v-for="(field, index) in bookingFields" :key="index">
            <strong>{{ field.label }}: </strong>
            <template v-if="field.name === 'client_id'">
              <select v-model="currentBooking.client_id" required>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.first_name }} {{ client.last_name }}
                </option>
              </select>
            </template>
            <template v-else-if="field.name === 'asset_id'">
              <select v-model="currentBooking.asset_id" required>
                <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                  {{ asset.reg_no }}
                </option>
              </select>
            </template>
            <template v-else>
              <input v-model="currentBooking[field.name]" :type="field.type" required />
            </template>
          </div>
          <button type="submit">Update</button>
        </form>
      </template>
    </Modal>

    <Modal v-if="showViewModal" @close="closeViewModal">
      <template #header>View Booking</template>
      <template #body>
        <div v-for="(field, index) in bookingFields" :key="index">
          <strong>{{ field.label }}: </strong>
          <span>{{ currentBooking[field.name] }}</span>
        </div>
        <button @click="changeStatus('Approved')">Approve</button>
        <button @click="changeStatus('Rejected')">Reject</button>
      </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
      <template #header>Delete Booking</template>
      <template #body>
        <p>Are you sure you want to delete this booking?</p>
        <button @click="deleteBooking">Yes</button>
        <button @click="closeDeleteModal">No</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Modal from '../../components/Modal.vue';
import { API_ENDPOINT } from '../../config';

const bookings = ref([]);
const clients = ref([]);
const assets = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 5;

const newBooking = ref({
  status: 'Pending',
  client_id: '',
  client_mobile: '',
  client_email: '',
  asset_id: '',
  driver_name: '',
  from_address: '',
  to_address: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  mileage: '',
  fuel_level: '',
  amount: '',
  vehicle_park_fee: '',
  driver_charges: '',
  delivery_charges: '',
  supplier_price: '',
  client_address: '',
  client_company_id: '',
  client_department: '',
  action_date: '',
  description: ''
});
const currentBooking = ref(null);
const bookingToDelete = ref(null);

const bookingFields = [
  { label: 'Client ID', name: 'client_id', type: 'number' },
  { label: 'Client Mobile', name: 'client_mobile', type: 'text' },
  { label: 'Client Email', name: 'client_email', type: 'email' },
  { label: 'Asset ID', name: 'asset_id', type: 'number' },
  { label: 'Driver Name', name: 'driver_name', type: 'text' },
  { label: 'From Address', name: 'from_address', type: 'text' },
  { label: 'To Address', name: 'to_address', type: 'text' },
  { label: 'Start Date', name: 'start_date', type: 'date' },
  { label: 'Start Time', name: 'start_time', type: 'number' },
  { label: 'End Date', name: 'end_date', type: 'date' },
  { label: 'End Time', name: 'end_time', type: 'number' },
  { label: 'Mileage', name: 'mileage', type: 'number' },
  { label: 'Fuel Level', name: 'fuel_level', type: 'text' },
  { label: 'Price', name: 'amount', type: 'text' },
  { label: 'Vehicle Park Fee', name: 'vehicle_park_fee', type: 'number' },
  { label: 'Driver Charges', name: 'driver_charges', type: 'number' },
  { label: 'Delivery Charges', name: 'delivery_charges', type: 'number' },
  { label: 'Supplier Price', name: 'supplier_price', type: 'number' },
  { label: 'Client Address', name: 'client_address', type: 'text' },
  { label: 'Client Company ID', name: 'client_company_id', type: 'text' },
  { label: 'Client Department', name: 'client_department', type: 'text' },
  { label: 'Action Date: ', name: 'action_date', type: 'date'},
  { label: 'Description', name: 'description', type: 'text' }
];

const fetchBookings = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/car_rentals`);
    bookings.value = response.data.sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
  } catch (error) {
    console.error(error);
  }
};

const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/cust_clients`);
    clients.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchAssets = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/assets`);
    assets.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const openAddModal = () => showAddModal.value = true;
const closeAddModal = () => showAddModal.value = false;

const openEditModal = (booking) => {
  currentBooking.value = { ...booking };
  showEditModal.value = true;
};
const closeEditModal = () => showEditModal.value = false;

const openViewModal = (booking) => {
  currentBooking.value = { ...booking };
  showViewModal.value = true;
};
const closeViewModal = () => showViewModal.value = false;

const openDeleteModal = (booking) => {
  bookingToDelete.value = booking;
  showDeleteModal.value = true;
};
const closeDeleteModal = () => showDeleteModal.value = false;

const addBooking = async () => {
  try {
    await axios.post(`${API_ENDPOINT}/car_rentals`, newBooking.value);
    closeAddModal();
    fetchBookings();
  } catch (error) {
    console.error(error);
  }
};

const updateBooking = async () => {
  try {
    await axios.put(`${API_ENDPOINT}/car_rentals/${currentBooking.value.id}`, currentBooking.value);
    closeEditModal();
    fetchBookings();
  } catch (error) {
    console.error(error);
  }
};

const deleteBooking = async () => {
  try {
    await axios.delete(`${API_ENDPOINT}/car_rentals/${bookingToDelete.value.id}`);
    closeDeleteModal();
    fetchBookings();
  } catch (error) {
    console.error(error);
  }
};

const changeStatus = async (status) => {
  try {
    currentBooking.value.status = status;
    await updateBooking();
    closeViewModal();
    fetchBookings();
  } catch (error) {
    console.error(error);
  }
};

const statusOrder = (status) => {
  switch (status) {
    case 'Pending':
      return 1;
    case 'Approved':
      return 2;
    case 'Rejected':
      return 3;
    default:
      return 4;
  }
};

const statusClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'status-pending';
    case 'Approved':
      return 'status-approved';
    case 'Rejected':
      return 'status-rejected';
    default:
      return '';
  }
};

const getClientName = (clientId) => {
  const client = clients.value.find(client => client.id === clientId);
  return client ? `${client.first_name} ${client.last_name}` : 'Unknown';
};

const getAssetRegNo = (assetId) => {
  const asset = assets.value.find(asset => asset.id === assetId);
  return asset ? asset.reg_no : 'Unknown';
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return bookings.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(bookings.value.length / itemsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchBookings();
  fetchClients();
  fetchAssets();
});
</script>

<style scoped>
.car-rental {
  margin: 2rem;
}
.navbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}
.booking-list {
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
  background-color: #f4f4f4;
}
.status-pending {
  background-color: yellow;
}
.status-approved {
  background-color: green;
  color: white;
}
.status-rejected {
  background-color: red;
  color: white;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
button:disabled {
  cursor: not-allowed;
}
</style>
