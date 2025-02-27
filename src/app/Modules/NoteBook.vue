<template>
  <div class="container mt-4">
    <b-button variant="primary" @click="addSection" class="mb-3">Add Section</b-button>
    <b-card v-for="(section, index) in sections" :key="index" class="mb-3">
      <b-card-header @click="toggleSection(index)" class="d-flex justify-content-between align-items-center">
        <strong>{{ section.title || `Section ${index + 1}` }}</strong>
        <b-button size="sm" variant="outline-secondary">{{ section.expanded ? '−' : '+' }}</b-button>
      </b-card-header>
      <b-collapse :id="`section-${index}`" v-model="section.expanded">
        <b-card-body>
          <b-form-textarea v-model="section.summary" placeholder="Write a summary..." class="mb-3"></b-form-textarea>
          <h5>Q&A</h5>
          <b-card v-for="(qa, qIndex) in section.qa" :key="qIndex" class="mb-2 p-3">
            <b-form-input v-model="qa.question" placeholder="Question" class="mb-2"></b-form-input>
            <b-form-textarea v-model="qa.answer" placeholder="Answer"></b-form-textarea>
          </b-card>
          <b-button size="sm" variant="success" @click="addQA(index)">Add Q&A</b-button>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sections: []
    };
  },
  methods: {
    addSection() {
      this.sections.push({ title: '', summary: '', qa: [], expanded: false });
    },
    toggleSection(index) {
      this.sections[index].expanded = !this.sections[index].expanded;
    },
    addQA(index) {
      this.sections[index].qa.push({ question: '', answer: '' });
    }
  }
};
</script>

<style>
.container {
  max-width: 600px;
}
</style>
