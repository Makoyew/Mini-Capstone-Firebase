<template>
  <div class="w-full mx-auto mt-5 p-4">
    <h1 class="text-4xl font-bold text-white mb-8">All Authors ({{ authors.length }})</h1>
    <div v-if="isLoading" class="flex justify-center items-center h-[400px]">
      <p class="text-white">Loading...</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="(author, index) in authors"
        :key="index"
        :class="['bg-gray-800', author.gender === 'Female' ? 'female-card' : 'male-card']"
        @click="viewAuthor(author.id)"
      >
        <div class="h-[200px] flex items-center justify-center">
          <i
            v-if="author.gender === 'Female'"
            class="fas fa-female text-9xl text-white"
          ></i>
          <i v-else class="fas fa-male text-9xl text-white"></i>
        </div>
        <div class="p-4">
          <p class="text-lg font-medium text-white">{{ author.fullname }}</p>
          <p class="text-sm text-gray-300 mt-1">
            <span v-if="author.postCount > 1">Total Posts: {{ author.postCount }}</span>
            <span v-else>Total Post: {{ author.postCount }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import { db } from '../Firebase/index.js';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const authors = ref([]);
    const isLoading = ref(true);
    const router = useRouter();

    onMounted(async () => {
      await fetchAuthors();
    });

    async function fetchAuthors() {
      const authorsCollection = collection(db, 'authors');
      const q = query(authorsCollection);

      try {
        const querySnapshot = await getDocs(q);
        const fetchedAuthors = [];

        for (const doc of querySnapshot.docs) {
          const authorData = doc.data();

          const postsCollection = collection(db, 'posts');
          const authorPostsQuery = query(postsCollection, where('author', '==', authorData.fullname));
          const authorPostsSnapshot = await getDocs(authorPostsQuery);
          const postCount = authorPostsSnapshot.size;

          const author = {
            id: doc.id,
            fullname: authorData.fullname,
            gender: authorData.gender,
            postCount: postCount
          };
          fetchedAuthors.push(author);
        }

        authors.value = fetchedAuthors;
        isLoading.value = false;
      } catch (error) {
        console.log('Error getting authors:', error);
      }
    }

    function viewAuthor(authorId) {
      router.push(`/authorPosts/${authorId}`);
    }

    return {
      authors,
      isLoading,
      viewAuthor
    };
  }
};
</script>

<style>
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.box {
  width: 400px;
  margin-top: 20px;
  background-color: #f1f1f1;
  border-radius: 10px;
  text-align: center;
  line-height: 400px;
  border: 1px solid #ccc;
}

.bg-gray-800 {
  background-color: #1f2937;
}

.text-white {
  color: #fff;
}

.text-gray-300 {
  color: #d1d5db;
}

.female-card:hover {
  background-color: #cc3366; /* Update with desired color */
}

.male-card:hover {
  background-color: #3366cc; /* Update with desired color */
}
</style>