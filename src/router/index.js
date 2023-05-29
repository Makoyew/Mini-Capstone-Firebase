import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import CreateView from '../views/CreateView.vue'
import PostsView from '../views/PostsView.vue'
import AuthorsView from '../views/AuthorsView.vue'
import AuthPostsView from '../views/AuthPostsView.vue'
import AuthorPostsView from '../views/AuthorPostsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/create',
      name: 'create',
      component: CreateView
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'authors',
      component: AuthorsView
    },
    {
      path: '/authPost',
      name: 'authPost',
      component: AuthPostsView
    },
    {
      path: '/authorPosts/:authorId',
      cname: 'authorPosts',
      component: AuthorPostsView
    },
  ]
})

export default router
