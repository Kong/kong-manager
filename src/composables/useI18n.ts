import { useI18n as i18n } from '@kong-ui-public/i18n'
import type english from '@/locales/en.json'

export const useI18n = i18n<typeof english>
