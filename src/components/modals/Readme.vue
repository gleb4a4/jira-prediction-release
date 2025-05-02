<template>
  <div v-if="isVisible" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <button class="close-button" @click="hideModal">×</button>
        <h2>README</h2>
      </div>
      <div class="content" v-html="readmeContent"></div>
    </div>
    <div class="modal-overlay" @click="hideModal"></div>
  </div>
</template>

<script>
import { inject, defineEmits } from 'vue';
export default {
  name: 'Modal',
  data() {
    return {
      readmeContent: ''
    }
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  mounted() {
    this.readmeContent = inject('readmeContent');
  },
  methods: {
    hideModal() {
      this.$emit('close');
    }
  },
};
</script>

<style>
/* CSS стилі для модалки */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: #181818;
}
.modal-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  text-align: left;
  overflow-y: auto;
  max-height: 80%;
  z-index: 2;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  background: #3b82f6;
}

.content {
  margin-top: 20px;
}
</style>
