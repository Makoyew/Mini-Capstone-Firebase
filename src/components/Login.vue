<template>
  <div class="login-form mt-3 text-white">
    <div v-show="error" class="alert alert-danger">
      {{ errorMsg }}
    </div>
    <div v-show="success" class="alert alert-success">
      {{ successMsg }}
    </div>
    <h2 class="title">Login Account</h2>
    <form class="form" @submit.prevent="loginUser">
      <div class="input_fields">
        <label for="email" class="label">Email:</label>
        <div class="input-container">
          <input type="email" id="email" class="input text-black" v-model="email">
        </div>
      </div>
      <div class="input_fields">
        <label for="password" class="label">Password:</label>
        <div class="input-container">
          <input type="password" id="password" class="input text-black" v-model="password">
        </div>
      </div>
      <div class="login-form__submit">
        <button class="login-form__button" type="submit">Login</button>
      </div>
    </form>
    <div class="login-form__register-link mt-3">
      Don't have an account yet?
      <router-link to="register" style="color:blue;">Sign up</router-link>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { auth } from '../Firebase/index.js'
  import { signInWithEmailAndPassword} from '@firebase/auth'
  import router from '../router/index.js'

  const email = ref('')
  const password = ref('')
  const error = ref('')
  const errorMsg = ref('')
  const success = ref('')
  const successMsg = ref('')

  const loginUser = () => {
    if (email.value && password.value) {
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((cred) => {
          if (cred.user.emailVerified) {
            router.push('/posts')
          } else {
            error.value = true
            errorMsg.value = "Your account is not yet verified."
            email.value = ''
            password.value = ''
          }
        })
        .catch((err) => {
          error.value = true
          errorMsg.value = err.message
        })
    } else {
      error.value = true
      errorMsg.value = 'Please fill out both email and password fields.'
    }
  }
</script>

<style scoped>
.login-form {
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

.input-container {
  flex: 1;
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

.login-form__submit {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.login-form__button {
  padding: 1rem 2rem;
  background-color: #4a5568;
  color: #ffffff;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.login-form__button:hover {
  background-color: #2d3748;
}

.login-form__register-link {
  text-align: center;
  color: #ffffff;
  font-size: 0.9rem;
}

.login-form__register-link a {
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