<template>
  <div class="service-schedule">
    <nav class="navbar">
        <h1>Service Schedule</h1>
    <input v-model="searchQuery" @input="filterSchedules" placeholder="Search schedules...">
    <button @click="openAddModal">Add Service Schedule</button>
    </nav>
    <div class="schedule-list">
    <table>
        <thead>
        <tr>
            <th>Asset Id</th>
            <th>Status</th>
            <th>Service Type</th>
            <th>Expected Service Date</th>
            <th>Scheduled By</th>
            <th>Description</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in paginatedSchedules" :key="schedule.id">
            <td>{{ getAssetId(schedule.asset_id) }}</td>
            <td>{{ schedule.status }}</td>
            <td>{{ schedule.service_type }}</td>
            <td>{{ formatDate(schedule.expected_service_date) }}</td>
            <td>{{ schedule.scheduled_by }}</td>
            <td>{{ schedule.description }}</td>
            <td>
            <button @click="openEditModal(schedule)">Update</button>
            <button @click="openDeleteModal(schedule)">Delete</button>
            </td>
        </tr>
        </tbody>
    </table>
    <div v-if="schedules.length > rowsPerPage" class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    </div>

    <Modal v-if="showAddModal" @close="closeAddModal">
    <template #header>Add Service Schedule</template>
    <template #body>
        <form @submit.prevent="addSchedule">
        <div>
            <strong>Asset Id: </strong>
            <select v-model="newSchedule.asset_id" required>
            <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
        </div>
        <div>
            <strong>Status: </strong>
            <input v-model="newSchedule.status" placeholder="Status" required>
        </div>
        <div>
            <strong>Service Type: </strong>
            <input v-model="newSchedule.service_type" placeholder="Service Type" required>
        </div>
        <div>
            <strong>Expected Service Date: </strong>
            <input v-model="newSchedule.expected_service_date" type="date" required>
        </div>
        <div>
            <strong>Scheduled By: </strong>
            <input v-model="newSchedule.scheduled_by" placeholder="Scheduled By" required>
        </div>
        <div>
            <strong>Description: </strong>
            <input v-model="newSchedule.description" placeholder="Description" required>
        </div>
        <button type="submit">Save</button>
        </form>
    </template>
    </Modal>

    <Modal v-if="showEditModal" @close="closeEditModal">
    <template #header>Update Service Schedule</template>
    <template #body>
        <form @submit.prevent="updateSchedule">
        <div>
            <strong>Asset Id: </strong>
            <select v-model="currentSchedule.asset_id">
            <option v-for="asset in assets" :key="asset.id" :value="asset.id">{{ asset.reg_no }}</option>
            </select>
        </div>
        <div>
            <strong>Status: </strong>
            <input v-model="currentSchedule.status" placeholder="Status">
        </div>
        <div>
            <strong>Service Type: </strong>
            <input v-model="currentSchedule.service_type" placeholder="Service Type">
        </div>
        <div>
            <strong>Expected Service Date: </strong>
            <input v-model="currentSchedule.expected_service_date" type="date">
        </div>
        <div>
            <strong>Scheduled By: </strong>
            <input v-model="currentSchedule.scheduled_by" placeholder="Scheduled By">
        </div>
        <div>
            <strong>Description: </strong>
            <input v-model="currentSchedule.description" placeholder="Description">
        </div>
        <button type="submit">Update</button>
        </form>
    </template>
    </Modal>

    <Modal v-if="showDeleteModal" @close="closeDeleteModal">
    <template #header>Delete Schedule</template>
    <template #body>
        <p>Are you sure you want to delete this service schedule?</p>
        <button @click="deleteSchedule">Yes</button>
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

const schedules = ref([])
const assets = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const newSchedule = ref({
asset_id: '',
status: '',
service_type: '',
expected_service_date: '',
scheduled_by: '',
description: ''
})

const currentSchedule = ref(null)
const scheduleToDelete = ref(null)

const searchQuery = ref("")
const rowsPerPage = 10
const currentPage = ref(1)

const paginatedSchedules = computed(() => {
if (!schedules.value) return []
const filteredSchedules = schedules.value.filter(schedule => {
    return Object.values(schedule).some(value => 
    String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})
const start = (currentPage.value - 1) * rowsPerPage
return filteredSchedules.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => {
if (!schedules.value) return 1
const filteredSchedules = schedules.value.filter(schedule => {
    return Object.values(schedule).some(value => 
    String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})
return Math.ceil(filteredSchedules.length / rowsPerPage)
})

const fetchSchedules = async () => {
try {
    const response = await axios.get(`${API_ENDPOINT}/assets_services_schedule`)
    schedules.value = response.data
} catch (error) {
    console.error('Error fetching schedules:', error)
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

const addSchedule = async () => {
try {
    const response = await axios.post(`${API_ENDPOINT}/assets_services_schedule`, newSchedule.value)
    schedules.value.push(response.data)
    closeAddModal()
} catch (error) {
    console.error('Error adding schedule:', error)
}
}

const openAddModal = () => {
newSchedule.value = {
    asset_id: '',
    status: '',
    service_type: '',
    expected_service_date: '',
    scheduled_by: '',
    description: ''
}
showAddModal.value = true
}

const closeAddModal = () => {
showAddModal.value = false
}

const openEditModal = (schedule) => {
currentSchedule.value = { ...schedule }
showEditModal.value = true
}

const updateSchedule = async () => {
try {
    await axios.put(`${API_ENDPOINT}/assets_services_schedule/${currentSchedule.value.id}`, currentSchedule.value)
    const index = schedules.value.findIndex(s => s.id === currentSchedule.value.id)
    schedules.value.splice(index, 1, currentSchedule.value)
    closeEditModal()
} catch (error) {
    console.error('Error updating schedule:', error)
}
}

const closeEditModal = () => {
showEditModal.value = false
}

const openDeleteModal = (schedule) => {
scheduleToDelete.value = schedule
showDeleteModal.value = true
}

const deleteSchedule = async () => {
try {
    await axios.delete(`${API_ENDPOINT}/assets_services_schedule/${scheduleToDelete.value.id}`)
    const index = schedules.value.findIndex(s => s.id === scheduleToDelete.value.id)
    schedules.value.splice(index, 1)
    closeDeleteModal()
} catch (error) {
    console.error('Error deleting schedule:', error)
}
}

const closeDeleteModal = () => {
showDeleteModal.value = false
}

const filterSchedules = () => {
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
fetchSchedules()
fetchAssets()
})
</script>

<style scoped>
.service-schedule {
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

.schedule-list table {
width: 100%;
border-collapse: collapse;
}

.schedule-list th, .schedule-list td {
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

form div {
margin-bottom: 1rem;
}

form strong {
display: block;
margin-bottom: 0.5rem;
}

form input, form select {
padding: 0.5rem;
width: 100%;
}

form button {
padding: 0.5rem 1rem;
}
</style>
  