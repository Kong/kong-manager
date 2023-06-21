import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/home/Home.vue'),
  },
]

// add entity routes
const entities: string[] = ['service']

entities.forEach((entity: string) => {
  const entityPlural = `${entity}s`

  routes.push(
    {
      name: `${entity}-list`,
      path: `/${entityPlural}`,
      component: () => import(`@/pages/${entityPlural}/List.vue`),
      meta: {
        entity,
      },
    },
    {
      name: `${entity}-create`,
      path: `/${entityPlural}/create`,
      component: () => import(`@/pages/${entityPlural}/Form.vue`),
      meta: {
        entity,
      },
    },
    {
      name: `${entity}-edit`,
      path: `/${entityPlural}/:id/edit`,
      component: () => import(`@/pages/${entityPlural}/Form.vue`),
      meta: {
        entity,
      },
    },
    {
      name: `${entity}-detail`,
      path: `/${entityPlural}/:id`,
      component: () => import(`@/pages/${entityPlural}/Detail.vue`),
      meta: {
        entity,
      },
    },
  )
})

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
