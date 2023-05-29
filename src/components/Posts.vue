<template>
  <div>
    <div class="row justify-content-center shadow mt-2 align-items-center bg-primary-dark">
      <div class="col-md-6 mt-3 mb-3 justify-content-center">
        <div class="form-floating">
          <select class="form-select custom-select text-black" v-model="postCategory">
            <option value="" disabled>Select a Category</option>
            <option value="all">All</option>
            <option value="Pop">Pop</option>
            <option value="Drama">Drama</option>
            <option value="Comedy">Comedy</option>
            <option value="Adventure">Adventure</option>
            <option value="Business">Business</option>
            <option value="Politics">Politics</option>
            <option value="Religion">Religion</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.category }}</option>
          </select>
          <label for="category" class="form-label text-white">Category</label>
        </div>
      </div>
    </div>
    <div class="col-md-4 offset-md-4 mt-5" v-for="post in paginatedPosts" :key="post.id">
      <div class="post">
        <div class="post-header">
          <p class="post-author">{{ post.author }}</p>
          <p class="post-category">{{ getCategoryName(post.category_id) }}</p>
        </div>
        <div class="post-content">
          <div class="content-container">
            <p class="content-text">{{ post.content }}</p>
          </div>
        </div>
        <p class="post-date">{{ formatDate(post.createdAt) }}</p>
      </div>
    </div>
    <div class="row mt-4" v-if="paginatedPosts.length === 0">
      <div class="col">
        <p class="no-posts-text text-center font-semibold">No posts yet.</p>
      </div>
    </div>
    <div class="row mt-4" v-if="totalPages > 1">
      <div class="col">
        <nav aria-label="Pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">First</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">Last</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { db } from '../Firebase/index.js';
import { collection, getDocs } from 'firebase/firestore';

const posts = ref([]);
const categories = ref([]);
const postSearch = ref('');
const postCategory = ref('');
const currentPage = ref(1);
const postsPerPage = 1;

const fetchPosts = async () => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  posts.value = querySnapshot.docs.map(doc => {
    const postData = doc.data();
    return {
      id: doc.id,
      author: postData.author,
      category_id: postData.category_id,
      content: postData.content,
      createdAt: postData.createdAt.toDate(),
      gender: postData.gender
    };
  });
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const fetchCategories = async () => {
  const querySnapshot = await getDocs(collection(db, 'categories'));
  categories.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const filteredPosts = computed(() => {
  const searchQuery = postSearch.value.toLowerCase().trim();
  const selectedCategory = postCategory.value;

  if (!searchQuery && !selectedCategory) {
    return posts.value;
  } else {
    return posts.value.filter(post => {
      const postAuthor = post.author.toLowerCase();
      const postContent = post.content.toLowerCase();

      return (
        (!searchQuery ||
          postAuthor.includes(searchQuery) ||
          postContent.includes(searchQuery)) &&
        (!selectedCategory || selectedCategory === 'all' || post.category_id === selectedCategory)
      );
    });
  }
});

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage));

const paginatedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  return filteredPosts.value.slice(startIndex, endIndex);
});

const goToPage = page => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(async () => {
  await Promise.all([fetchPosts(), fetchCategories()]);
});

const getCategoryName = categoryId => {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.category : '';
};

watch([postSearch, postCategory], () => {
  currentPage.value = 1;
});
</script>


<style scoped>
.post {
  position: relative;
  width: 600px;
  background-color: #22223B;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.post:hover {
  transform: translateY(-5px);
}

.post-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-author {
  font-size: 20px;
  font-weight: bold;
  color: #F8F9FA;
}

.post-category {
  font-size: 16px;
  color: #F8F9FA;
}

.post-content {
  width: 100%;
  margin-bottom: 10px;
}

.content-container {
  background-color: #F8F9FA;
  border-radius: 5px;
  padding: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.content-text {
  text-align: justify;
  margin: 0;
  color: #22223B;
}

.post-date {
  font-size: 14px;
  color: #F8F9FA;
}

.row.justify-content-center.shadow.mt-2.align-items-center {
  background-color: rgb(102, 108, 110);
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);
}

.col-md-4 {
  margin-bottom: 20px;
}

.custom-select {
  background-color: transparent;
  border: none;
  border-radius: 0;
  border-bottom: 2px solid #F8F9FA;
  box-shadow: none;
  color: #37393b;
}

.custom-select:focus {
  background-color: transparent !important;
  box-shadow: none !important;
  border-bottom: 2px solid #F8F9FA;
}

.form-label {
  color: #F8F9FA;
}

.pagination {
  justify-content: center;
  margin-top: 20px;
}

.pagination .page-item.disabled .page-link {
  color: #F8F9FA;
  background-color: transparent;
  border-color: #F8F9FA;
}

.pagination .page-item.disabled .page-link:hover {
  color: #F8F9FA;
  background-color: transparent;
  border-color: #F8F9FA;
}

.pagination .page-item .page-link {
  color: #22223B;
  background-color: #F8F9FA;
  border-color: #F8F9FA;
}

.pagination .page-item .page-link:hover {
  color: #F8F9FA;
  background-color: #22223B;
  border-color: #22223B;
}

.no-posts-text {
  color: #F8F9FA;
  font-weight: bold;
}

.bg-primary-dark {
  background-color: #22223B;
}

.text-white {
  color: #F8F9FA;
}
</style>
