import {
  createRouter, createWebHistory, type RouteRecordRaw,
} from 'vue-router'

import { config } from 'config'
import { useInfoStore } from './stores/info'
import { useAuthStore } from './stores/auth'

const routes: RouteRecordRaw[] = [
  // auth pages
  {
    name: 'login',
    path: '/login',
    component: () => import('@/pages/auth/Login.vue'),
    meta: {
      title: 'Giriş Yap',
      requiresAuth: false,
    },
  },
  {
    name: 'change-password',
    path: '/change-password',
    component: () => import('@/pages/auth/ChangePassword.vue'),
    meta: {
      title: 'Şifre Değiştir',
      requiresAuth: true,
    },
  },

  // dashboard page
  {
    name: 'dashboard',
    path: '/dashboard',
    component: () => import('@/pages/dashboard/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
  },

  // overview page
  {
    name: 'overview',
    path: '/',
    component: () => import('@/pages/overview/Overview.vue'),
    meta: {
      title: 'Overview',
      requiresAuth: true,
    },
  },

  // not found page
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: 'Not Found',
      requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'service-create',
    path: '/services/create',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
      title: 'Create Gateway Service',
      requiresAuth: true,
    },
  },
  {
    name: 'service-edit',
    path: '/services/:id/edit',
    component: () => import('@/pages/services/Form.vue'),
    meta: {
      entity: 'service',
      title: 'Edit Gateway Service',
      requiresAuth: true,
    },
  },
  {
    name: 'service-detail',
    path: '/services/:id',
    component: () => import('@/pages/services/Detail.vue'),
    meta: {
      entity: 'service',
      title: 'View Gateway Service',
      requiresAuth: true,
    },
    children: [
      {
        name: 'service-detail-routes',
        path: 'routes',
        component: () => import('@/pages/routes/List.vue'),
        meta: {
          entity: 'service',
          title: 'Gateway Service Routes',
          requiresAuth: true,
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
          requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'route-create',
    path: '/routes/create',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
      title: 'Create Route',
      requiresAuth: true,
    },
  },
  {
    name: 'route-edit',
    path: '/routes/:id/edit',
    component: () => import('@/pages/routes/Form.vue'),
    meta: {
      entity: 'route',
      title: 'Edit Route',
      requiresAuth: true,
    },
  },
  {
    name: 'route-detail',
    path: '/routes/:id',
    component: () => import('@/pages/routes/Detail.vue'),
    meta: {
      entity: 'route',
      title: 'View Route',
      requiresAuth: true,
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
          requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'consumer-create',
    path: '/consumers/create',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
      title: 'Create Consumer',
      requiresAuth: true,
    },
  },
  {
    name: 'consumer-edit',
    path: '/consumers/:id/edit',
    component: () => import('@/pages/consumers/Form.vue'),
    meta: {
      entity: 'consumer',
      title: 'Edit Consumer',
      requiresAuth: true,
    },
  },
  {
    name: 'consumer-detail',
    path: '/consumers/:id',
    component: () => import('@/pages/consumers/Detail.vue'),
    meta: {
      entity: 'consumer',
      title: 'View Consumer',
      requiresAuth: true,
    },
    children: [
      {
        name: 'consumer-detail-credentials',
        path: 'credentials',
        component: () => import('@/pages/consumers/ConsumerCredentials.vue'),
        meta: {
          entity: 'consumer',
          title: 'Consumer Credentials',
          requiresAuth: true,
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
          requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'consumer-detail-credentials-edit',
    path: '/consumers/:id/credentials/:pluginType/:credentialId/edit',
    component: () => import('@/pages/consumers/CredentialForm.vue'),
    meta: {
      entity: 'consumer',
      title: 'Edit Consumer Credential',
      requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'plugin-select',
    path: '/plugins/select',
    component: () => import('@/pages/plugins/Select.vue'),
    meta: {
      entity: 'plugin',
      title: 'Select Plugin',
      requiresAuth: true,
    },
  },
  {
    name: 'plugin-create',
    path: '/plugins/:pluginType/create',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
      title: 'Create Plugin',
      requiresAuth: true,
    },
  },
  {
    name: 'plugin-edit',
    path: '/plugins/:pluginType/:id/edit',
    component: () => import('@/pages/plugins/Form.vue'),
    meta: {
      entity: 'plugin',
      title: 'Edit Plugin',
      requiresAuth: true,
    },
  },
  {
    name: 'plugin-detail',
    path: '/plugins/:pluginType/:id',
    component: () => import('@/pages/plugins/Detail.vue'),
    meta: {
      entity: 'plugin',
      title: 'View Plugin',
      requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'upstream-create',
    path: '/upstreams/create',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
      title: 'Create Upstream',
      requiresAuth: true,
    },
  },
  {
    name: 'upstream-edit',
    path: '/upstreams/:id/edit',
    component: () => import('@/pages/upstreams/Form.vue'),
    meta: {
      entity: 'upstream',
      title: 'Edit Upstream',
      requiresAuth: true,
    },
  },
  {
    name: 'upstream-detail',
    path: '/upstreams/:id',
    component: () => import('@/pages/upstreams/Detail.vue'),
    meta: {
      entity: 'upstream',
      title: 'View Upstream',
      requiresAuth: true,
    },
    children: [
      {
        name: 'upstream-detail-targets',
        path: 'targets',
        component: () => import('@/pages/upstreams/TargetList.vue'),
        meta: {
          entity: 'upstream',
          title: 'Upstream Targets',
          requiresAuth: true,
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
      requiresAuth: true,
    },
  },
  {
    name: 'sni-create',
    path: '/snis/create',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
      title: 'Create SNI',
      requiresAuth: true,
    },
  },
  {
    name: 'sni-edit',
    path: '/snis/:id/edit',
    component: () => import('@/pages/snis/Form.vue'),
    meta: {
      entity: 'sni',
      title: 'Edit SNI',
      requiresAuth: true,
    },
  },

  // key set pages
  {
    name: 'key-set-list',
    path: '/key-sets',
    component: () => import('@/pages/key-sets/List.vue'),
    meta: {
      entity: 'key-set',
      title: 'Key Sets',
      requiresAuth: true,
    },
  },
  {
    name: 'key-set-create',
    path: '/key-sets/create',
    component: () => import('@/pages/key-sets/Form.vue'),
    meta: {
      entity: 'key-set',
      title: 'Create Key Set',
      requiresAuth: true,
    },
  },
  {
    name: 'key-set-edit',
    path: '/key-sets/:id/edit',
    component: () => import('@/pages/key-sets/Form.vue'),
    meta: {
      entity: 'key-set',
      title: 'Edit Key Set',
      requiresAuth: true,
    },
  },
  {
    name: 'key-set-detail',
    path: '/key-sets/:id',
    component: () => import('@/pages/key-sets/Detail.vue'),
    meta: {
      entity: 'key-set',
      title: 'View Key Set',
      requiresAuth: true,
    },
    children: [
      {
        name: 'key-set-detail-keys',
        path: 'keys',
        component: () => import('@/pages/keys/List.vue'),
        meta: {
          entity: 'key-set',
          title: 'Key Set Keys',
          requiresAuth: true,
        },
      },
    ],
  },

  // Data plane nodes pages
  // {
  //   name: 'data-plane-nodes',
  //   path: '/data-plane-nodes',
  //   component: () => import('@/pages/data-plane-nodes/List.vue'),
  //   meta: {
  //     entity: 'data-plane-node',
  //     title: 'Data Plane Nodes',
  //   },
  // },
]

type EntityNameDefinition = { key: string, keyPlural?: string, capitalizedName?: string, capitalizedNamePlural?: string }

type EntityName = string | EntityNameDefinition

/**
 * Add other entity routes. Each of these entities should have and only have:
 * - a list page
 * - a create page
 * - an edit page
 * - and a detail page
 */
const entities: EntityName[] = [
  'certificate',
  {
    key: 'ca-certificate',
    keyPlural: 'ca-certificates',
    capitalizedName: 'CA Certificate',
    capitalizedNamePlural: 'CA Certificates',
  },
  'vault',
  'key',
]

entities.forEach((entityName: EntityName) => {
  const entity = typeof entityName === 'string' ? { key: entityName } : entityName

  entity.keyPlural = entity.keyPlural ?? `${entity.key}s`
  entity.capitalizedName = entity.capitalizedName ?? `${entity.key.charAt(0).toUpperCase()}${entity.key.slice(1)}`.replace(/(-[a-z])/, ([_, letter]) => ` ${letter.toUpperCase()}`)
  entity.capitalizedNamePlural = `${entity.capitalizedName}s`

  routes.push(
    {
      name: `${entity.key}-list`,
      path: `/${entity.keyPlural}`,
      component: () => import(`@/pages/${entity.keyPlural}/List.vue`),
      meta: {
        entity: entity.key,
        title: `${entity.capitalizedNamePlural}`,
        requiresAuth: true,
      },
    },
    {
      name: `${entity.key}-create`,
      path: `/${entity.keyPlural}/create`,
      component: () => import(`@/pages/${entity.keyPlural}/Form.vue`),
      meta: {
        entity: entity.key,
        title: `Create ${entity.capitalizedName}`,
        requiresAuth: true,
      },
    },
    {
      name: `${entity.key}-edit`,
      path: `/${entity.keyPlural}/:id/edit`,
      component: () => import(`@/pages/${entity.keyPlural}/Form.vue`),
      meta: {
        entity: entity.key,
        title: `Edit ${entity.capitalizedName}`,
        requiresAuth: true,
      },
    },
    {
      name: `${entity.key}-detail`,
      path: `/${entity.keyPlural}/:id`,
      component: () => import(`@/pages/${entity.keyPlural}/Detail.vue`),
      meta: {
        entity: entity.key,
        title: `View ${entity.capitalizedName}`,
        requiresAuth: true,
      },
    },
  )
})

export const router = createRouter({
  history: createWebHistory(config.ADMIN_GUI_PATH),
  routes,
})

router.beforeEach((to, from, next) => {
  const infoStore = useInfoStore()
  const authStore = useAuthStore()

  // Kullanıcı bilgisini geri yükle
  authStore.restoreUser()

  // Auth kontrolü
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Zaten giriş yapmış kullanıcı login sayfasına gitmeye çalışırsa ana sayfaya yönlendir
  if (to.name === 'login' && authStore.isAuthenticated) {
    next('/')
    return
  }

  infoStore.getInfo({ silent: true })
  next()
})
