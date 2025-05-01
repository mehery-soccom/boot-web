<template>
  <div class="error-message" v-if="message">
    <p>{{ message }}</p>
    <button @click="retry" v-if="retryAction">Retry</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    retryAction: {
      type: Function,
      default: null,
    },
  },
  methods: {
    retry() {
      if (this.retryAction) {
        this.retryAction();
      }
    },
  },
};
</script>

<style scoped>
.error-message {
  background-color: #ffebee;
  border: 1px solid #ef5350;
  color: #b71c1c;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  margin: 0;
}

.error-message button {
  background-color: #ef5350;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.error-message button:hover {
  background-color: #e53935;
}
</style>
