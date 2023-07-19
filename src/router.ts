import { datadogRum } from '@datadog/browser-rum'
import {
  createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw,
} from 'vue-router'

import { config } from 'config'

const routes: Array<RouteRecordRaw> = [
  // home page
  {
    name: 'home',
    path: '/',
    component: () => import('@/pages/home/Home.vue'),
    meta: {
      title: 'Home',
    },
  },

  // not found page
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: 'Not Found',
    },
  },

  // service pages
  {
    name: 'service-list',
    path: '/services',
    component: () => import('@/pages/services/List.vue'),
    meta: {
      entity: 'service',
      title: 'Gateway Services',
    },
  },
  {
    name: 'service-create',
    path: '/services/create',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
      title: 'Create Gateway Service',
    },
  },
  {
    name: 'service-edit',
    path: '/services/:id/edit',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
      title: 'Edit Gateway Service',
    },
  },
  {
    name: 'service-detail',
    path: '/services/:id',
    component: () => import('@/pages/services/Detail.vue'),
    meta: {
      entity: 'service',
      title: 'View Gateway Service',
    },
    children: [
      {
        name: 'service-detail-routes',
        path: 'routes',
        component: () => import('@/pages/routes/List.vue'),
        meta: {
          entity: 'service',
          title: 'Gateway Service Routes',
        },
      },
      {
        name: 'service-detail-plugins',
        path: 'plugins',
        component: () => import('@/pages/plugins/List.vue'),
        meta: {
          entity: 'service',
          scopedIn: 'services',
          title: 'Gateway Service Plugins',
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
      title: 'Routes',
    },
  },
  {
    name: 'route-create',
    path: '/routes/create',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
      title: 'Create Route',
    },
  },
  {
    name: 'route-edit',
    path: '/routes/:id/edit',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
      title: 'Edit Route',
    },
  },
  {
    name: 'route-detail',
    path: '/routes/:id',
    component: () => import('@/pages/routes/Detail.vue'),
    meta: {
      entity: 'route',
      title: 'View Route',
    },
    children: [
      {
        name: 'route-detail-plugins',
        path: 'plugins',
        component: () => import('@/pages/plugins/List.vue'),
        meta: {
          entity: 'route',
          scopedIn: 'routes',
          title: 'Route Plugins',
        },
      },
    ],
  },

  // consumer pages
  {
    name: 'consumer-list',
    path: '/consumers',
    component: () => import('@/pages/consumers/List.vue'),
    meta: {
      entity: 'consumer',
      title: 'Consumers',
    },
  },
  {
    name: 'consumer-create',
    path: '/consumers/create',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
      title: 'Create Consumer',
    },
  },
  {
    name: 'consumer-edit',
    path: '/consumers/:id/edit',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
      title: 'Edit Consumer',
    },
  },
  {
    name: 'consumer-detail',
    path: '/consumers/:id',
    component: () => import('@/pages/consumers/Detail.vue'),
    meta: {
      entity: 'consumer',
      title: 'View Consumer',
    },
    children: [
      {
        name: 'consumer-detail-credentials',
        path: 'credentials',
        component: () => import('@/pages/consumers/ConsumerCredentials.vue'),
        meta: {
          entity: 'consumer',
          title: 'Consumer Credentials',
        },
      },
      {
        name: 'consumer-detail-plugins',
        path: 'plugins',
        component: () => import('@/pages/plugins/List.vue'),
        meta: {
          entity: 'consumer',
          scopedIn: 'consumers',
          title: 'Consumer Plugins',
        },
      },
    ],
  },
  {
    name: 'consumer-detail-credentials-create',
    path: '/consumers/:id/credentials/:pluginType/create',
    component: () => import('@/pages/consumers/CredentialForm.vue'),
    meta: {
      entity: 'consumer',
      title: 'Create Consumer Credential',
    },
  },
  {
    name: 'consumer-detail-credentials-edit',
    path: '/consumers/:id/credentials/:pluginType/:credentialId/edit',
    component: () => import('@/pages/consumers/CredentialForm.vue'),
    meta: {
      entity: 'consumer',
      title: 'Edit Consumer Credential',
    },
  },

  // plugin pages
  {
    name: 'plugin-list',
    path: '/plugins',
    component: () => import('@/pages/plugins/List.vue'),
    meta: {
      entity: 'plugin',
      title: 'Plugins',
    },
  },
  {
    name: 'plugin-select',
    path: '/plugins/select',
    component: () => import('@/pages/plugins/Select.vue'),
    meta: {
      entity: 'plugin',
      title: 'Select Plugin',
    },
  },
  {
    name: 'plugin-create',
    path: '/plugins/:pluginType/create',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
      title: 'Create Plugin',
    },
  },
  {
    name: 'plugin-edit',
    path: '/plugins/:pluginType/:id/edit',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
      title: 'Edit Plugin',
    },
  },
  {
    name: 'plugin-detail',
    path: '/plugins/:pluginType/:id',
    component: () => import('@/pages/plugins/Detail.vue'),
    meta: {
      entity: 'plugin',
      title: 'View Plugin',
    },
  },

  // upstream pages
  {
    name: 'upstream-list',
    path: '/upstreams',
    component: () => import('@/pages/upstreams/List.vue'),
    meta: {
      entity: 'upstream',
      title: 'Upstreams',
    },
  },
  {
    name: 'upstream-create',
    path: '/upstreams/create',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
      title: 'Create Upstream',
    },
  },
  {
    name: 'upstream-edit',
    path: '/upstreams/:id/edit',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
      title: 'Edit Upstream',
    },
  },
  {
    name: 'upstream-detail',
    path: '/upstreams/:id',
    component: () => import('@/pages/upstreams/Detail.vue'),
    meta: {
      entity: 'upstream',
      title: 'View Upstream',
    },
    children: [
      {
        name: 'upstream-detail-targets',
        path: 'targets',
        component: () => import('@/pages/upstreams/TargetList.vue'),
        meta: {
          entity: 'upstream',
          title: 'Upstream Targets',
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
      title: 'SNIs',
    },
  },
  {
    name: 'sni-create',
    path: '/snis/create',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
      title: 'Create SNI',
    },
  },
  {
    name: 'sni-edit',
    path: '/snis/:id/edit',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
      title: 'Edit SNI',
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
  const capitalizedEntity = `${entity.charAt(0).toUpperCase()}${entity.slice(1)}`.replace(/(-[a-z])/, ([_, letter]) => ` ${letter.toUpperCase()}`)
  const capitalizedEntityPlural = `${capitalizedEntity}s`

  routes.push(
    {
      name: `${entity}-list`,
      path: `/${entityPlural}`,
      component: () => import(`@/pages/${entityPlural}/List.vue`),
      meta: {
        entity,
        title: `${capitalizedEntityPlural}`,
      },
    },
    {
      name: `${entity}-create`,
      path: `/${entityPlural}/create`,
      component: () => import(`@/pages/${entityPlural}/Form.vue`),
      meta: {
        entity,
        title: `Create ${capitalizedEntity}`,
      },
    },
    {
      name: `${entity}-edit`,
      path: `/${entityPlural}/:id/edit`,
      component: () => import(`@/pages/${entityPlural}/Form.vue`),
      meta: {
        entity,
        title: `Edit ${capitalizedEntity}`,
      },
    },
    {
      name: `${entity}-detail`,
      path: `/${entityPlural}/:id`,
      component: () => import(`@/pages/${entityPlural}/Detail.vue`),
      meta: {
        entity,
        title: `View ${capitalizedEntity}`,
      },
    },
  )
})

export const router = createRouter({
  history: createWebHistory(config.ADMIN_GUI_PATH),
  routes,
})

const extractRouteName = (route: RouteLocationNormalized) => {
  const name = route.name
  let routeName: string | undefined

  if (typeof name === 'string') {
    routeName = name
  } else if (typeof name === 'symbol') {
    routeName = name.description
  }

  return routeName
}

router.afterEach(to => {
  document.title = `${to.meta.title} | Kong Manager OSS`
  datadogRum.startView({
    name: extractRouteName(to) || 'unknown',
  })
})
