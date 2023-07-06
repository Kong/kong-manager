export default {
  data () {
    return {
      isSaveActionDisabled: false,
    }
  },

  computed: {
    formRef () {
      return this.$refs.form
    },
  },

  mounted () {
    this.isSaveActionDisabled = this.formRef.isSaveActionDisabled
    this.$watch('formRef.isSaveActionDisabled', (disabled) => {
      this.isSaveActionDisabled = disabled
    })
  },

  methods: {
    handleFormSave () {
      return this.formRef.confirm()
    },

    handleFormCancel () {
      return this.formRef.cancel()
    },
  },
}
