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
  'upstream',
  'certificate',
  'ca-certificate',
  ['sni', { noDetail: true }],
  'vault',
  'key-set',
  'key',
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

routes.push(
  {
    name: 'plugin-list',
    path: '/plugins',
    component: () => import('@/pages/plugins/List.vue'),
    meta: {
      entity: 'plugin',
    },
  },
  {
    name: 'plugin-select',
    path: '/plugins/select',
    component: () => import('@/pages/plugins/Select.vue'),
    meta: {
      entity: 'plugin',
    },
  },
  {
    name: 'plugin-create',
    path: '/plugins/:pluginType/create',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
    },
  },
  {
    name: 'plugin-edit',
    path: '/plugins/:pluginType/:id/edit',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
    },
  },
  {
    name: 'plugin-detail',
    path: '/plugins/:pluginType/:id',
    component: () => import('@/pages/plugins/Detail.vue'),
    meta: {
      entity: 'plugin',
    },
  },
)

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
