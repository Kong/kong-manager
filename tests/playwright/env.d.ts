declare global {
  namespace NodeJS {
    interface ProcessEnv {
      KM_TEST_GUI_URL?: string
      // We have fallback for this env variable in .env
      KM_TEST_API_URL: string
    }
  }
}

export {}