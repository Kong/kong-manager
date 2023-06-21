import { useToaster } from './useToaster'

interface CopyEventPayload {
  message: string
}

export const useCopyEventHandlers = () => {
  const toaster = useToaster()

  const onCopySuccess = (payload: CopyEventPayload) => {
    toaster.open({
      appearance: 'success',
      message: payload.message,
    })
  }

  const onCopyError = (payload: CopyEventPayload) => {
    toaster.open({
      type: 'danger',
      message: payload.message,
    })
  }

  return {
    onCopySuccess,
    onCopyError,
  }
}
