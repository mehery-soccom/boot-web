<!-- src/components/QAPairsTable.vue -->
<template>
  <div class="qa-table-container">
    <h1 class="title">QA Pairs Explorer</h1>

    <!-- Tenant Form -->
    <div class="tenant-form-container" v-if="!tenantPartitionKey">
      <form @submit.prevent="submitTenantKey" class="tenant-form">
        <div class="form-group">
          <label for="tenantKey">Tenant Partition Key:</label>
          <input
            type="text"
            id="tenantKey"
            v-model="tempTenantKey"
            required
            placeholder="Enter tenant partition key"
            class="form-input"
          />
        </div>
        <button type="submit" class="btn btn-primary">Load Data</button>
      </form>
    </div>

    <!-- Tenant Display & Change Option -->
    <div class="tenant-info" v-else>
      <div class="current-tenant">
        <span
          >Current Tenant: <strong>{{ tenantPartitionKey }}</strong></span
        >
        <button @click="changeTenant" class="btn btn-secondary">Change Tenant</button>
      </div>

      <div class="data-controls">
        <button @click="fetchData" class="btn btn-primary">Fetch Data</button>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- Actions Bar - Only show when items are loaded and selections are possible -->
    <div v-if="!loading && qaData.length > 0" class="actions-bar">
      <div class="selection-info">
        <span v-if="selectedIds.length === 0">No items selected</span>
        <span v-else>{{ selectedIds.length }} item(s) selected</span>
      </div>
      <div class="bulk-actions">
        <button @click="confirmDeleteSelected" class="btn btn-danger" :disabled="selectedIds.length === 0">
          Delete Selected
        </button>
        <button @click="toggleSelectAll" class="btn btn-secondary">
          {{ allSelected ? "Unselect All" : "Select All" }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="!loading && qaData.length > 0" class="table-wrapper">
      <div class="table-header">
        <h2>QA Pairs Data</h2>
        <span class="data-info">Showing {{ qaData.length }} of {{ totalItems }} items</span>
      </div>

      <div class="table-responsive">
        <table class="qa-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  id="selectAll"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
                />
              </th>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in qaData" :key="item.id">
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  :id="`item-${item.id}`"
                  :value="item.id"
                  v-model="selectedIds"
                  class="checkbox"
                />
              </td>
              <td>{{ extractQuestion(item.$meta.knowledgebase) }}</td>
              <td>{{ extractAnswer(item.$meta.knowledgebase) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <div class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</div>
        <div class="pagination-controls">
          <button @click="previousPage" :disabled="currentPage === 1" class="btn btn-pagination">
            <span>←</span> Previous
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-pagination">
            Next <span>→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- No Data Message -->
    <div v-if="!loading && tenantPartitionKey && qaData.length === 0" class="no-data">
      <p>No QA pairs data available. Please check the tenant key and try again.</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete {{ selectedIds.length }} selected item(s)?</p>
        <p class="delete-warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteSelected" class="btn btn-danger">Delete</button>
          <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
        </div>
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
      qaData: [],
      selectedIds: [],
      loading: false,
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: 25,
      lastSeenId: null,
      tenantPartitionKey: null,
      tempTenantKey: "",
      showDeleteModal: false,
      statusMessage: "",
      statusType: "info", // 'info', 'success', 'error'
      statusTimeout: null,
      lastSeenIdHistory: [],
    };
  },

  computed: {
    allSelected() {
      return this.qaData.length > 0 && this.selectedIds.length === this.qaData.length;
    },
  },

  methods: {
    submitTenantKey() {
      if (this.tempTenantKey.trim()) {
        this.tenantPartitionKey = this.tempTenantKey.trim();
        this.tempTenantKey = "";
        // Reset pagination state
        this.currentPage = 1;
        this.lastSeenId = null;
        this.qaData = [];
        this.selectedIds = [];
      }
    },

    changeTenant() {
      this.tenantPartitionKey = null;
      this.qaData = [];
      this.selectedIds = [];
      this.currentPage = 1;
      this.lastSeenId = null;
    },

    async fetchData() {
      if (!this.tenantPartitionKey) return;

      this.loading = true;
      this.selectedIds = []; // Clear selections when refreshing data

      try {
        // Construct the URL based on the current page
        let url = `http://localhost:8090/nexus/notebook/api/qapairs/vectordb?page=${this.currentPage}&pageSize=${this.pageSize}`;
        // let url = `http://localhost:8090/nexus/notebook/api/qapairs/mongodb?page=${this.currentPage}&pageSize=${this.pageSize}`;

        // Add lastSeenId parameter for pages beyond the first page
        if (this.currentPage > 1 && this.lastSeenId) {
          url += `&lastSeenId=${this.lastSeenId}`;
        }

        const response = await fetch(url,{
  method: 'GET', // or 'POST', 'PUT', etc. as needed
  headers: {
    'Content-Type': 'application/json',
    'tnt': this.tenantPartitionKey // Replace with your actual value
  }
});

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        this.qaData = data.data;
        this.totalPages = parseInt(data.totalPages);
        this.totalItems = parseInt(data.total);

        // Update the lastSeenId for pagination
        if (this.qaData.length > 0) {
          this.lastSeenId = this.qaData[this.qaData.length - 1].id;
        }
      } catch (error) {
        console.error("Error fetching QA pairs:", error);
        this.qaData = [];
        this.showStatus("Failed to load data: " + error.message, "error");
      } finally {
        this.loading = false;
      }
    },

    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = this.qaData.map((item) => item.id);
      }
    },

    confirmDeleteSelected() {
      if (this.selectedIds.length > 0) {
        this.showDeleteModal = true;
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
    },

    async deleteSelected() {
      this.showDeleteModal = false;
      this.loading = true;

      try {
        // Prepare the request to delete the selected records
        const url = `http://localhost:8090/nexus/notebook/api/qapairs`;
        console.log(`tenant_partition_key : ${this.tenantPartitionKey}`);
        console.log(`ids : ${this.selectedIds}`);
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'tnt' : this.tenantPartitionKey
          },
          body: JSON.stringify({
            tenant_partition_key: this.tenantPartitionKey,
            del_ids: this.selectedIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        // Show success message
        this.showStatus(`Successfully deleted ${this.selectedIds.length} item(s)`, "success");
        const data = await response.json();
        console.log(`response del : ${JSON.stringify(data)}`);
        // Clear selections and refresh data
        this.selectedIds = [];
        this.lastSeenIdHistory = [];
        this.lastSeenId = null;
        this.currentPage = 1;
        this.fetchData();
      } catch (error) {
        console.error("Error deleting records:", error);
        this.showStatus("Failed to delete records: " + error.message, "error");
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

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.lastSeenIdHistory.push(this.lastSeenId);
        this.currentPage += 1;
        this.fetchData();
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        // When going back to page 1, reset lastSeenId
        if (this.currentPage === 1) {
          this.lastSeenId = null;
          this.lastSeenIdHistory = [];
        } else {
          const len = this.lastSeenIdHistory.length;
          if (len >= 2) {
            this.lastSeenId = this.lastSeenIdHistory[len - 2];
            this.lastSeenIdHistory.pop();
          }
        }
        this.fetchData();
      }
    },

    extractQuestion(text) {
      const match = text.match(/Question\s*:\s*(.*?)\s*\n/);
      return match ? match[1].trim() : "No question found";
    },

    extractAnswer(text) {
      const match = text.match(/Answer\s*:\s*(.*)/s);
      return match ? match[1].trim() : "No answer found";
    },
  },
};
</script>

<style scoped>
.qa-table-container {
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
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tenant-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* Button Styles */
.btn {
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #dee2e6;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-pagination {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 8px 14px;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e9ecef;
}

/* Tenant Info Styles */
.tenant-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.current-tenant {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.bulk-actions {
  display: flex;
  gap: 10px;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Table Styles */
.table-wrapper {
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.data-info {
  color: #6c757d;
  font-size: 14px;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
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
  padding: 16px;
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

.checkbox-col {
  width: 50px;
  text-align: center;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.qa-table th:nth-child(2) {
  width: 40%;
}

.qa-table tr:last-child td {
  border-bottom: none;
}

.qa-table tr:hover {
  background-color: #f8f9fa;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 8px;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  gap: 12px;
}

/* No Data Message */
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-top: 24px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #2c3e50;
}

.delete-warning {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
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
  .qa-table-container {
    padding: 15px;
  }

  .title {
    font-size: 24px;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .tenant-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .current-tenant {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .bulk-actions {
    width: 100%;
    justify-content: space-between;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .qa-table th,
  .qa-table td {
    padding: 12px 8px;
    font-size: 14px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }

  .status-message {
    min-width: auto;
    max-width: 90%;
    left: 5%;
    right: 5%;
  }

  .form-input,
  .btn {
    font-size: 14px;
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .qa-table-container {
    padding: 10px;
  }

  .title {
    font-size: 20px;
  }

  .checkbox-col {
    width: 30px;
  }

  .checkbox {
    width: 16px;
    height: 16px;
  }

  .qa-table th,
  .qa-table td {
    padding: 10px 6px;
    font-size: 13px;
  }

  .btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .tenant-form-container {
    padding: 15px;
  }

  .modal-content {
    padding: 16px;
  }
}
</style>
