<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-15 ">
        <div class="card">
          <div class="card-header bg-cyan text-black">
            <h5 class="card-title text-center">Categories</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-center mb-3">
              <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newCategoryModal">Add Category</button>
            </div>
            <table class="table table-bordered table-hover borderclr shadow">
              <thead class="bghdcolor theadclr">
                <tr class="text-center">
                  <th>Category</th>
                </tr>
              </thead>
              <tbody class="bgcolor">
                <tr v-for="category in categories" :key="category.id">
                  <td class="text-center">{{ category.category }}</td>
                  <td>{{ category.remarks }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="newCategoryModal" tabindex="-1" data-bs-backdrop="static" aria-labelledby="newCategory" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bghdcolor theadclr">
          <h1 class="modal-title fs-5" id="newCategory">Add Category</h1>
        </div>
        <div class="modal-body bgcolor">
          <div class="col-md-7 mx-auto">
            <div class="mb-3">
              <label for="category" class="form-label">Category</label>
              <input type="text" class="form-control createcolor" id="category" placeholder="Category" v-model="category">
            </div>
            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
          </div>
        </div>
        <div class="modal-footer bghdcolor d-flex justify-content-center">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="store()">Add Category</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../Firebase/index.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const categories = ref([]);
const category = ref('');
const errorMessage = ref('');

const store = async () => {
  if (category.value.trim() === '') {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  const newCategory = {
    category: category.value,
    remarks: remarks.value
  };

  try {
    await addDoc(collection(db, 'categories'), newCategory);
    category.value = '';
    errorMessage.value = '';
    fetchCategories();
    const modal = document.getElementById('newCategoryModal');
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    bootstrapModal.hide();
  } catch (error) {
    console.error('Error adding category:', error);
  }
};


const fetchCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    categories.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

onMounted(fetchCategories);
</script>