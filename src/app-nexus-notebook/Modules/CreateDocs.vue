<!-- src/components/CreateDocs.vue -->
<template>
  <div class="create-docs-container">
    <h1 class="title">Create QA Pairs</h1>

    <!-- Tenant Input Form -->
    <div class="tenant-form-container">
      <form @submit.prevent="submitForm" class="tenant-form">
        <div class="form-group">
          <label for="tenantKey">Tenant Partition Key:</label>
          <input
            type="text"
            id="tenantKey"
            v-model="tenantPartitionKey"
            required
            placeholder="Enter tenant partition key"
            class="form-input"
          />
        </div>
      </form>
    </div>

    <!-- QA Pairs Table -->
    <div class="qa-editor">
      <div class="table-controls">
        <h2>QA Pairs</h2>
        <button @click="addNewRow" class="btn btn-primary">Add Row</button>
      </div>

      <div class="table-responsive">
        <table class="qa-table">
          <thead>
            <tr>
              <th class="index-col">#</th>
              <th>Question</th>
              <th>Answer</th>
              <th class="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pair, index) in qaPairs" :key="index">
              <td class="index-col">{{ index + 1 }}</td>
              <td>
                <textarea
                  v-model="pair.que"
                  placeholder="Enter question..."
                  class="form-textarea"
                  rows="3"
                  required
                ></textarea>
              </td>
              <td>
                <textarea
                  v-model="pair.ans"
                  placeholder="Enter answer..."
                  class="form-textarea"
                  rows="3"
                  required
                ></textarea>
              </td>
              <td class="action-col">
                <button @click="removeRow(index)" class="btn btn-danger btn-sm" :disabled="qaPairs.length === 1">
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Submit Button -->
      <div class="submit-container">
        <button @click="submitQAPairs" class="btn btn-success" :disabled="!isFormValid || loading">
          {{ loading ? "Submitting..." : "Submit QA Pairs" }}
        </button>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" :class="['status-message', 'status-' + statusType]">
      {{ statusMessage }}
      <button @click="clearStatus" class="status-close">&times;</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tenantPartitionKey: "",
      qaPairs: [
        {
          que: "",
          ans: "",
        },
      ],
      loading: false,
      statusMessage: "",
      statusType: "info", // 'info', 'success', 'error'
      statusTimeout: null,
    };
  },

  computed: {
    isFormValid() {
      // Check if tenant key is provided and all QA pairs have content
      if (!this.tenantPartitionKey.trim()) return false;

      return this.qaPairs.every((pair) => pair.que.trim() !== "" && pair.ans.trim() !== "");
    },
  },

  methods: {
    addNewRow() {
      this.qaPairs.push({
        que: "",
        ans: "",
      });
    },

    removeRow(index) {
      // Don't remove if it's the last row
      if (this.qaPairs.length <= 1) return;
      this.qaPairs.splice(index, 1);
    },

    async submitQAPairs() {
      if (!this.isFormValid) {
        this.showStatus("Please fill in all fields", "error");
        return;
      }

      this.loading = true;

      try {
        // Format the data as required
        const payload = {
          tenant_partition_key: this.tenantPartitionKey,
          kb_id: "7f30a30c-5c25-4eea-a3a1-2ff93ebd6257",
          article_id: "9577ad6e-eca2-4c41-a39b-c621e4ceb699",
          ques: this.qaPairs.map((pair) => ({
            que: pair.que.trim(),
            ans: pair.ans.trim(),
          })),
        };

        // Send the data to the API
        const response = await fetch("http://localhost:8090/nexus/notebook/api/qapairs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            tnt   : this.tenantPartitionKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Show success message
        this.showStatus(`Successfully added ${this.qaPairs.length} QA pair(s)`, "success");

        // Reset form for new entries but keep the tenant key
        this.qaPairs = [{ que: "", ans: "" }];
      } catch (error) {
        console.error("Error submitting QA pairs:", error);
        this.showStatus("Failed to submit: " + error.message, "error");
      } finally {
        this.loading = false;
      }
    },

    showStatus(message, type = "info") {
      this.statusMessage = message;
      this.statusType = type;

      // Clear any existing timeout
      if (this.statusTimeout) {
        clearTimeout(this.statusTimeout);
      }

      // Auto-clear success and info messages after 5 seconds
      if (type !== "error") {
        this.statusTimeout = setTimeout(() => {
          this.clearStatus();
        }, 5000);
      }
    },

    clearStatus() {
      this.statusMessage = "";
      if (this.statusTimeout) {
        clearTimeout(this.statusTimeout);
        this.statusTimeout = null;
      }
    },
  },
};
</script>

<style scoped>
.create-docs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif;
  color: #333;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 28px;
  margin-bottom: 24px;
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 16px;
}

/* Tenant Form Styles */
.tenant-form-container {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tenant-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

.form-textarea {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 15px;
  width: 100%;
  min-height: 80px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-textarea:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

/* QA Editor Table */
.qa-editor {
  margin-top: 24px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-controls h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.qa-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 6px;
  overflow: hidden;
}

.qa-table th,
.qa-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.qa-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
}

.index-col {
  width: 40px;
  text-align: center;
}

.action-col {
  width: 100px;
  text-align: center;
}

.btn-sm {
  padding: 6px 10px;
  font-size: 14px;
}

/* Submit Button */
.submit-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* Status Message */
.status-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 500px;
  z-index: 90;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-info {
  background-color: #3498db;
  color: white;
}

.status-success {
  background-color: #2ecc71;
  color: white;
}

.status-error {
  background-color: #e74c3c;
  color: white;
}

.status-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 0 0 10px;
  margin-left: 10px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .create-docs-container {
    padding: 15px;
  }

  .title {
    font-size: 24px;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .table-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .submit-container {
    flex-direction: column;
  }

  .submit-container .btn {
    width: 100%;
  }

  .status-message {
    min-width: auto;
    max-width: 90%;
    left: 5%;
    right: 5%;
  }
}

@media (max-width: 480px) {
  .create-docs-container {
    padding: 10px;
  }

  .title {
    font-size: 20px;
  }

  .form-textarea {
    padding: 8px;
    font-size: 14px;
  }

  .qa-table th,
  .qa-table td {
    padding: 8px 6px;
    font-size: 14px;
  }

  .action-col {
    width: 70px;
  }

  .btn-sm {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
