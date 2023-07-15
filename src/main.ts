import { createApp } from 'vue'
import { datadogRum } from '@datadog/browser-rum'
import { config } from 'config'
import * as pkg from '../package.json'
import { createI18n, Translation } from '@kong-ui-public/i18n'
import english from '@/locales/en.json'
import App from '@/App.vue'
import { router } from '@/router'
import { registerGlobalComponents } from './registerGlobalComponents'
import './styles/index'

const i18n = createI18n<typeof english>('en-us', english, { isGlobal: true })

const app = createApp(App)

app.use(Translation.install<typeof english>, { i18n })
app.use(router)
registerGlobalComponents(app)

const checkDatadogEnabled = () => !!(
  config?.ANONYMOUS_REPORTS &&
  import.meta.env.VITE_DATADOG_CLIENT_TOKEN &&
  import.meta.env.VITE_DATADOG_APPID
)

if (checkDatadogEnabled()) {
  datadogRum.init({
    applicationId: `${import.meta.env.VITE_DATADOG_APPID}`,
    clientToken: `${import.meta.env.VITE_DATADOG_CLIENT_TOKEN}`,
    site: 'datadoghq.com',
    service: 'kong-manager-oss',
    env: `${process.env.NODE_ENV}`,
    version: `${pkg.version}`,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    trackViewsManually: true,
    defaultPrivacyLevel: 'mask',
  })
  datadogRum.setGlobalContextProperty('gatewayVersion', config.GATEWAY_VERSION)
  datadogRum.setGlobalContextProperty('gatewayEdition', config.GATEWAY_EDITION)
  datadogRum.startSessionReplayRecording()
}

app.mount('#app')
