import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  // home page
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/home/Home.vue'),
  },

  // not found page
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFound.vue'),
  },

  // service pages
  {
    name: 'service-list',
    path: '/services',
    component: () => import('@/pages/services/List.vue'),
    meta: {
      entity: 'service',
    },
  },
  {
    name: 'service-create',
    path: '/services/create',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
    },
  },
  {
    name: 'service-edit',
    path: '/services/:id/edit',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
    },
  },
  {
    name: 'service-detail',
    path: '/services/:id',
    component: () => import('@/pages/services/Detail.vue'),
    meta: {
      entity: 'service',
    },
    children: [
      {
        name: 'service-detail-routes',
        path: '/services/:id/routes',
        component: () => import('@/pages/routes/List.vue'),
        meta: {
          entity: 'service',
        },
      },
    ],
  },

  // route pages
  {
    name: 'route-list',
    path: '/routes',
    component: () => import('@/pages/routes/List.vue'),
    meta: {
      entity: 'route',
    },
  },
  {
    name: 'route-create',
    path: '/routes/create',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
    },
  },
  {
    name: 'route-edit',
    path: '/routes/:id/edit',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
    },
  },
  {
    name: 'route-detail',
    path: '/routes/:id',
    component: () => import('@/pages/routes/Detail.vue'),
    meta: {
      entity: 'route',
    },
  },

  // consumer pages
  {
    name: 'consumer-list',
    path: '/consumers',
    component: () => import('@/pages/consumers/List.vue'),
    meta: {
      entity: 'consumer',
    },
  },
  {
    name: 'consumer-create',
    path: '/consumers/create',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
    },
  },
  {
    name: 'consumer-edit',
    path: '/consumers/:id/edit',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
    },
  },
  {
    name: 'consumer-detail',
    path: '/consumers/:id',
    component: () => import('@/pages/consumers/Detail.vue'),
    meta: {
      entity: 'consumer',
    },
  },

  // plugin pages
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

  // upstream pages
  {
    name: 'upstream-list',
    path: '/upstreams',
    component: () => import('@/pages/upstreams/List.vue'),
    meta: {
      entity: 'upstream',
    },
  },
  {
    name: 'upstream-create',
    path: '/upstreams/create',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
    },
  },
  {
    name: 'upstream-edit',
    path: '/upstreams/:id/edit',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
    },
  },
  {
    name: 'upstream-detail',
    path: '/upstreams/:id',
    component: () => import('@/pages/upstreams/Detail.vue'),
    meta: {
      entity: 'upstream',
    },
    children: [
      {
        name: 'upstream-detail-targets',
        path: 'targets',
        component: () => import('@/pages/upstreams/TargetList.vue'),
        meta: {
          entity: 'upstream',
        },
      },
    ],
  },

  // sni pages
  {
    name: 'sni-list',
    path: '/snis',
    component: () => import('@/pages/snis/List.vue'),
    meta: {
      entity: 'sni',
    },
  },
  {
    name: 'sni-create',
    path: '/snis/create',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
    },
  },
  {
    name: 'sni-edit',
    path: '/snis/:id/edit',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
    },
  },
]

// Add other entity routes. Each of these entities should have:
// - a list page
// - a create page
// - an edit page
// - and a detail page
const entities = [
  'certificate',
  'ca-certificate',
  'vault',
  'key-set',
  'key',
]

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
