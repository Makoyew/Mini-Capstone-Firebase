<template>
  <div>
    <h1 class="text-2xl text-white text-center mt-3">Your Posts</h1>
    <hr class="mt-3 mb-5">
    <div v-if="paginatedPosts.length > 0">
      <div class="grid justify-center">
        <div
          v-for="(post, index) in paginatedPosts"
          :key="index"
          class="post"
          :class="['post', post.gender && post.gender.toLowerCase() === 'male' ? 'post-male' : 'post-female']"
        >
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
    </div>
    <div v-else-if="authorPostsLoaded" class="text-center">
      <p>No posts found for this author.</p>
    </div>
    <div v-else class="text-center">
      <p>Loading...</p>
    </div>
    <div class="row mt-4" v-if="totalPages > 1">
      <div class="col">
        <nav aria-label="Pagination">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(1)">First</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)">Previous</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)">Next</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(totalPages)">Last</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { db, auth } from '../Firebase/index.js';
import { collection, getDocs, where, query } from 'firebase/firestore';

const posts = ref([]);
const categories = ref([]);
const postSearch = ref('');
const postCategory = ref('');
const currentPage = ref(1);
const postsPerPage = 1;
const userId = ref('');
const currentUser = ref({ fullname: '', gender: '' });

const retrieveCurrentUser = async () => {
  try {
    if (auth.currentUser) {
      const q = query(collection(db, 'authors'), where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const authorDoc = querySnapshot.docs[0];
        const authorData = authorDoc.data();
        currentUser.value = { fullname: authorData.fullname, gender: authorData.gender };
        userId.value = authorDoc.id;
        await fetchPosts(); // Call fetchPosts after setting the userId
      }
    }
  } catch (error) {
    console.error('Error retrieving current user:', error);
  }
};

const fetchCategories = async () => {
  const querySnapshot = await getDocs(collection(db, 'categories'));
  categories.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage));

const fetchPosts = async () => {
  try {
    if (userId.value) {
      const q = query(collection(db, 'posts'), where('author', '==', currentUser.value.fullname));
      const querySnapshot = await getDocs(q);
      const postDataArray = querySnapshot.docs.map((doc) => {
        const postData = doc.data();
        return {
          id: doc.id,
          author: postData.author,
          category_id: postData.category_id,
          content: postData.content,
          createdAt: postData.createdAt ? postData.createdAt.toDate() : new Date(),
          gender: postData.gender,
        };
      });

      posts.value = postDataArray;
      
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value;
      }
    } else {
      posts.value = [];
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
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

const getCategoryName = categoryId => {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.category : '';
};

onMounted(async () => {
  await Promise.all([fetchPosts(), fetchCategories(), retrieveCurrentUser()]);
});

watch([postSearch, postCategory], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.post {
  position: relative;
  width: 600px;
  height: auto;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.post:hover {
  transform: translateY(-3px);
}

.post-male {
  background-color: rgb(58, 182, 240);
}

.post-female {
  background-color: rgb(241, 145, 161);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-author {
  font-weight: bold;
}

.post-category {
  background-color: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
}

.post-content {
  margin-bottom: 10px;
}

.content-container {
  max-height: 200px;
  overflow: hidden;
}

.content-text {
  line-height: 1.4;
  background-color: white;
  border-radius: 5px;
  padding: 15px 20px;
}

.post-date {
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
}

.text-dark {
  color: #333;
}

.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 3rem;
}

.mb-5 {
  margin-bottom: 5rem;
}

.mt-4 {
  margin-top: 4rem;
}

.row {
  display: flex;
  justify-content: center;
}

.col {
  flex: 1;
}

.pagination {
  display: flex;
  justify-content: center;
  list-style: none;
}

.page-item {
  margin: 0 5px;
}

.page-link {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
}

.page-link:hover {
  background-color: #eee;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

.page-item.active .page-link {
  background-color: #333;
  color: #fff;
}
</style>