<template>
  <div class="register-form mt-3 text-white">
    <div v-show="error" class="alert alert-danger">
      {{ errorMsg }}
    </div>
    <div v-show="success" class="alert alert-success">
      {{ successMsg }}
    </div>
    <h2 class="title">Create an Account</h2>
    <form class="form" @submit.prevent="registerUser">
      <div class="input_fields">
        <label for="fullname" class="label">Full Name:</label>
        <input type="text" id="fullname" class="input text-black" v-model="fullname">
      </div>
      <div class="input_fields">
        <div class="label-group">
          <label class="label">Gender:</label>
          <div class="radio-group">
            <label>
              <input class="mr-2" type="radio" value="Male" v-model="gender">
              <span class="radio-label">Male</span>
            </label>
            <label>
              <input type="radio" value="Female" v-model="gender">
              <span class="radio-label">Female</span>
            </label>
          </div>
        </div>
      </div>
      <div class="input_fields">
        <label for="email" class="label">Email:</label>
        <input type="email" id="email" class="input text-black" v-model="email">
      </div>
      <div class="input_fields">
        <label for="password" class="label">Password:</label>
        <input type="password" id="password" class="input text-black" v-model="password">
      </div>
      <div class="input_fields">
        <label for="confirmPassword" class="label">Confirm Password:</label>
        <input type="password" id="confirmPassword" class="input text-black" v-model="confirmPassword">
      </div>
      <div class="register-form__submit mt-2">
        <button class="register-form__button" type="submit">Register</button>
      </div>
    </form>
    <div class="register-form__login-link mt-3">
      Already have an account?
      <router-link to="login" style="color:blue;">Log in</router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { db } from '../Firebase/index.js';
  import { collection, addDoc } from 'firebase/firestore';
  import { auth } from '../Firebase/index.js';
  import { createUserWithEmailAndPassword } from 'firebase/auth';

  const fullname = ref('');
  const gender = ref('');
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const error = ref(false);
  const errorMsg = ref('');
  const successMsg = ref('');

  const registerUser = async () => {
    if (
      fullname.value !== '' &&
      email.value !== '' &&
      password.value !== '' &&
      gender.value !== '' &&
      confirmPassword.value !== ''
    ) {
      if (password.value !== confirmPassword.value) {
        error.value = true;
        errorMsg.value = 'Passwords do not match';
        return;
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email.value, password.value);
        
        const authorData = {
          fullname: fullname.value,
          gender: gender.value,
          email: email.value,
          uid: cred.user.uid
        };

        fullname.value = '';
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
        gender.value = '';
        successMsg.value = 'Account created successfully.';

        await addDoc(collection(db, 'authors'), authorData);
      } catch (err) {
        error.value = true;
        errorMsg.value = err.message;
      }
    } else {
      error.value = true;
      errorMsg.value = 'Please fill out all the fields';
    }
  };
</script>


<style scoped>
.register-form {
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem;
  border: 2px solid #020202;
  border-radius: 1rem;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to bottom, #3b3d3f, #7c7a7a);
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
  font-size: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
}

.input_fields {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: bold;
  margin-right: 0.5rem;
  color: #fefeff;
}

.input {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  background-color: #e2e8f0;
  color: #1a202c;
  width: 100%;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  margin-left: 0.5rem;
  font-size: 1rem;
  color: #ffffff;
}

.register-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.register-form__button {
  padding: 1rem 2rem;
  background-color: #4a5568;
  color: #ffffff;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.register-form__button:hover {
  background-color: #2d3748;
}

.register-form__login-link {
  text-align: center;
  color: #ffffff;
  font-size: 0.9rem;
}

.register-form__login-link a {
  color: #020107;
  text-decoration: underline;
}

.alert {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f56565;
  color: #ffffff;
}

.alert-success {
  background-color: #48bb78;
  color: #ffffff;
}
</style>
