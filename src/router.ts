import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/home/Home.vue'),
  },
]

type RouterEntity = string | [string, { noDetail: boolean }]

// add entity routes
const entities: RouterEntity[] = [
  'service',
  'consumer',
  'plugin',
  'upstream',
  'certificate',
  'ca-certificate',
  ['sni', { noDetail: true }],
  'vault',
]

entities.forEach((routerEntity: RouterEntity) => {
  const entity = typeof routerEntity === 'string' ? routerEntity : routerEntity[0]
  const options = typeof routerEntity !== 'string' ? routerEntity[1] : undefined

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
  )

  if (!options?.noDetail) {
    routes.push(
      {
        name: `${entity}-detail`,
        path: `/${entityPlural}/:id`,
        component: () => import(`@/pages/${entityPlural}/Detail.vue`),
        meta: {
          entity,
        },
      }
    )
  }
})

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
