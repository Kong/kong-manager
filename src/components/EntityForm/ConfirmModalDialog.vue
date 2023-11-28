<template>
  <Teleport to="#app">
    <KPrompt
      v-bind="$attrs"
      ref="modal"
      type="warning"
      :title="headerTitle"
      :is-visible="visible"
      :tabbable-options="tabbableOptions"
      class="confirm-modal"
      @canceled="cancel"
    >
      <template #body-content>
        <slot name="body-text">
          <p>{{ bodyText }}</p>
        </slot>
        <div
          v-if="errorText"
          data-testid="error-message"
          class="error-message"
        >
          <KAlert
            :alert-message="errorText"
            :appearance="alertType"
          />
        </div>
      </template>
      <template #action-buttons>
        <KButton
          appearance="secondary"
          @click="cancel"
        >
          {{ dismissText }}
        </KButton>
        <KButton
          ref="actionButton"
          :appearance="actionClass"
          :disabled="disabled"
          class="actionButton"
          @click="ok"
        >
          <ProgressIcon v-if="isLoading" />
          {{ proceedText }}
        </KButton>
      </template>
    </KPrompt>
  </Teleport>
</template>

<script>
import { ProgressIcon } from '@kong/icons'
import { capitalize } from './helpers'

export default {
  name: 'ConfirmDialog',
  components: { ProgressIcon },
  inheritAttrs: false,
  props: {
    action: {
      type: String,
      default: '',
    },
    entityName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    proceedText: {
      type: String,
      default: 'Proceed',
    },
    dismissText: {
      type: String,
      default: 'Cancel',
    },
    errorText: {
      type: String,
      required: false,
      default: '',
    },
    alertType: {
      type: String,
      required: false,
      default: 'danger',
      validator: (val) => ['warning', 'danger'].includes(val),
    },
  },
  emits: ['ok', 'cancel'],
  computed: {
    headerTitle () {
      return this.title || `${capitalize(this.action)} ${this.entityName}`
    },
    bodyText () {
      return this.text || 'This action cannot be undone. Are you sure you want to proceed?'
    },
    actionClass () {
      return this.action === 'delete' || this.action === 'revoke' ? 'danger' : 'primary'
    },
    isTestEnv () {
      return process.env.NODE_ENV === 'test'
    },
    tabbableOptions () {
      return this.isTestEnv ? { displayCheck: 'none' } : {}
    },
  },
  updated () {
    this.$nextTick(() => {
      if (this.$refs.actionButton?.$el) {
        this.$refs.actionButton.$el.focus()
      }
    })
  },
  methods: {
    async ok () {
      this.$emit('ok')
    },
    async cancel () {
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="scss">
.confirm-modal {
  .modal-backdrop {
    z-index: 11000;
    .modal-dialog {
      .modal-header {
        gap: 10px;
      }
    }
  }

  &.k-modal .k-modal-footer .k-button:not(:last-child) {
    margin-right: $kui-space-50;
  }

  .error-message {
    margin-top: $kui-space-60;
  }
}
</style>
