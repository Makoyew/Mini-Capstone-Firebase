<template>
  <div>
    <h1 class="text-2xl text-dark text-center mt-3">{{ authorName }}'s Posts</h1>
    <hr class="mt-3 mb-5">
    <div v-if="paginatedPosts.length > 0">
      <div class="grid justify-center">
        <div
          v-for="(post, index) in paginatedPosts"
          :key="index"
          class="post"
          :class="['post', post.gender && post.gender.toLowerCase() === 'male' ? 'post-male' : 'post-female']">
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


<script>
import { ref, onMounted, computed, watch } from 'vue';
import { db } from '../Firebase/index.js';
import { collection, query, getDocs, getDoc, where, doc } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default {
  setup() {
    const authorPosts = ref([]);
    const authorPostsLoaded = ref(false);
    const categories = ref([]);
    const router = useRouter();
    const currentPage = ref(1);
    const postsPerPage = 1;
    const authorName = ref('');

    const fetchCategories = async () => {
      const categoriesCollection = collection(db, 'categories');
      try {
        const querySnapshot = await getDocs(categoriesCollection);
        const fetchedCategories = [];
        querySnapshot.forEach((doc) => {
          const categoryData = doc.data();
          const category = {
            id: doc.id,
            category: categoryData.category,
          };
          fetchedCategories.push(category);
        });
        categories.value = fetchedCategories;
      } catch (error) {
        console.log('Error getting categories:', error);
      }
    };

    const fetchAuthorPosts = async (authorName) => {
      const postsCollection = collection(db, 'posts');
      const authorPostsQuery = query(postsCollection, where('author', '==', authorName));

      try {
        const querySnapshot = await getDocs(authorPostsQuery);
        const fetchedPosts = [];

        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          const post = {
            id: doc.id,
            author: postData.author,
            category_id: postData.category_id,
            content: postData.content,
            createdAt: postData.createdAt.toDate(),
            gender: postData.gender,
          };
          fetchedPosts.push(post);
        });

        authorPosts.value = fetchedPosts;
        authorPostsLoaded.value = true;
      } catch (error) {
        console.log('Error getting author posts:', error);
      }
    };

    async function getAuthorNameById(authorId) {
      try {
        const authorDocRef = doc(db, 'authors', authorId);
        const authorDocSnapshot = await getDoc(authorDocRef);

        if (authorDocSnapshot.exists()) {
          const authorData = authorDocSnapshot.data();
          return authorData.fullname;
        } else {
          console.log('Author document does not exist');
          return null;
        }
      } catch (error) {
        console.log('Error retrieving author name:', error);
        return null;
      }
    }

    const getCategoryName = (categoryId) => {
      const category = categories.value.find((cat) => cat.id === categoryId);
      return category ? category.category : '';
    };

    const filteredPosts = computed(() => {
      return authorPosts.value;
    });

    const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage));

    const paginatedPosts = computed(() => {
      const startIndex = (currentPage.value - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      return filteredPosts.value.slice(startIndex, endIndex);
    });

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    onMounted(async () => {
      const authorId = router.currentRoute.value.params.authorId;
      const authorNameValue = await getAuthorNameById(authorId);
      if (authorNameValue) {
        await fetchAuthorPosts(authorNameValue);
        authorName.value = authorNameValue; 
      } else {
        console.log('Author name is undefined or missing.');
      }
    });

    onMounted(async () => {
      await fetchCategories();
    });

    return {
      paginatedPosts,
      currentPage,
      totalPages,
      formatDate,
      getCategoryName,
      authorPostsLoaded,
      goToPage,
      authorName,
    };
  },
};

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
  font-size: 20px;
  font-weight: bold;
  color: #333; 
}

.post-category {
  font-size: 16px;
  color: #666; 
}

.post-content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px; 
}

.content-container {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  width: 100%;
}

.content-text {
  text-align: center;
  margin: 0;
}

.post-date {
  font-size: 14px;
  color: #000000; 
}

.row {
  margin-top: 20px; 
}

.pagination {
  margin: 0; 
  padding: 0;
}

.page-item {
  list-style: none;
  display: inline-block;
  margin-right: 5px;
}

.page-link {
  display: inline-block;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  color: #333; 
  cursor: pointer;
}

.page-link:hover {
  background-color: #ccc;
}
</style>