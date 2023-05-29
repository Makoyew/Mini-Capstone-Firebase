<template>
  <header>
    <nav class="nav-container">
      <div class="nav-left">
        <a href="/">Cheaptalk</a>
      </div>
      <div class="nav-right">
        <ul v-show="!isSignedIn">
          <li><router-link to="/login" class="nav-link">Login</router-link></li>
        </ul>
        <ul v-show="isSignedIn">
          <router-link to="/posts" class="nav-link">Recent Posts</router-link>
          <li><router-link to="/" class="nav-link">Authors</router-link></li>
        </ul>
        <div class="dropdown" v-show="isSignedIn">
          <button class="dropbtn"> <i class="fa-solid fa-user"></i> {{ fullname ? fullname : 'User' }}</button>
          <div class="dropdown-content">
            <router-link to="/create" class="nav-link">Create Post <i class="fa-solid fa-circle-plus"></i></router-link>
            <router-link to="/authPost" class="nav-link">My Posts <i class="fa-solid fa-pen-to-square"></i></router-link>
            <router-link to="/" class="nav-link" @click="logout">Logout <i class="fa-solid fa-right-from-bracket"></i></router-link>
          </div>
        </div>
      </div>
    </nav>
  </header>
  <router-view />
</template>

<script setup>
  import { onAuthStateChanged, signOut } from 'firebase/auth';
  import { ref, onMounted } from 'vue';
  import { RouterLink, RouterView } from 'vue-router';
  import { auth, db } from './Firebase/index.js';
  import router from './router';
  import { collection, query, where, getDocs } from 'firebase/firestore';

  const isSignedIn = ref(false);
  const fullname = ref('');
  const gender = ref('');
  const email = ref('');

  onMounted(async () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        isSignedIn.value = true;
        router.push('/');
        const q = query(collection(db, 'authors'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          fullname.value = doc.data().fullname;
          gender.value = doc.data().gender;
          email.value = doc.data().email;
        });
      } else {
        router.push('/login');
      }
    });
  });

  const logout = () => {
    signOut(auth)
      .then(() => {
        isSignedIn.value = false;
      });
  };

  document.addEventListener("DOMContentLoaded", function (event) {
    var dropdowns = document.getElementsByClassName("dropdown");
    for (var i = 0; i < dropdowns.length; i++) {
      dropdowns[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.getElementsByClassName("dropdown-content")[0];
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }
  });
</script>

<style scoped>
  header {
    background-color: #131313;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.2rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    height: 4rem;
  }

  .nav-left {
    display: flex;
    align-items: center;
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .nav-right {
    display: flex;
    align-items: center;
  }

  nav ul {
    display: flex;
    gap: 1rem;
    margin: 0;
  }

  nav li {
    list-style: none;
  }

  .nav-link {
    color: #fff;
    text-decoration: none;
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease-in-out;
    font-size: 1.0rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .nav-link:hover {
    background-color: #fff;
    color: #131313;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropbtn {
    background-color: #131313;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    outline: none;
    transition: background-color 0.3s;
  }

  .dropbtn:hover {
    background-color: #f5f5f5;
    color: black;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 190px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    padding: 10px 0;
    border-radius: 5px;
  }

  .dropdown-content a {
    color: black;
    padding: 10px 20px;
    text-decoration: none;
    display: block;
    transition: background-color 0.3s;
  }

  .dropdown-content a:hover {
    background-color: #e9e9e9;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }
</style>
