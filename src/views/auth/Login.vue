<template>
  <div class="login-container">
    <div class="login-box">
      <img src="../../assets/fgtlogo.png" alt="Logo" class="logo" />
      <h2>Please Login</h2>
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="email">Email Address:</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_ENDPOINT }from '../../config'

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  try {
    const response = await axios.post(`${API_ENDPOINT}/auth/login`, { email: email.value, password: password.value });
    localStorage.setItem('token', response.data.token);

    // Wait for localStorage to be updated before fetching user
    await new Promise(resolve => setTimeout(resolve, 0));

    const userResponse = await axios.get(`${API_ENDPOINT}/auth/user`, {
      headers: { Authorization: `Bearer ${response.data.token}` }
    });

    localStorage.setItem('user', JSON.stringify(userResponse.data));
    router.push('/');
  } catch (err) {
    error.value = 'Invalid email or password';
  }
};

</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-box {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo {
  width: 100px;
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4ade80;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #3ac169;
}

.error {
  color: red;
  margin-top: 1rem;
}

</style>
