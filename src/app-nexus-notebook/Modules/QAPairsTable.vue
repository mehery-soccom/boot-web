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
        <button @click="refreshData" class="btn btn-primary">Refresh Data</button>
        <button 
          @click="updateEditedItems" 
          class="btn btn-success"
          :disabled="getEditedCount() === 0"
        >
          Update {{ getEditedCount() }} Edited Item(s)
        </button>
        <span v-if="Object.keys(cachedPages).length > 0" class="cache-info">
          {{ getCacheStatus() }}
        </span>
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
        <span v-if="getSelectedCount() === 0">No items selected</span>
        <span v-else>{{ getSelectedCount() }} item(s) selected</span>
      </div>
      <div class="bulk-actions">
        <button @click="confirmDeleteSelected" class="btn btn-danger" :disabled="getSelectedCount() === 0">
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
            <tr 
              v-for="item in qaData" 
              :key="item._id" 
              :class="{ 'edited-row': isItemEdited(item._id) }"
            >
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  :id="`item-${item._id}`"
                  :value="item._id"
                  v-model="selectedIdsByPage[currentPage]"
                  class="checkbox"
                />
              </td>
              <td 
                @click="startEditing(item._id, 'question')" 
                :class="{ 'editing': isEditingCell(item._id, 'question') }"
              >
                <div v-if="isEditingCell(item._id, 'question')" class="edit-container">
                  <textarea 
                    v-model="editingContent.text" 
                    class="edit-input"
                    @blur="finishEditing(item._id, 'question')"
                    @keydown.enter.prevent="finishEditing(item._id, 'question')"
                    ref="editTextarea"
                  ></textarea>
                </div>
                <div v-else>{{ item.question }}</div>
              </td>
              <td 
                @click="startEditing(item._id, 'answer')" 
                :class="{ 'editing': isEditingCell(item._id, 'answer') }"
              >
                <div v-if="isEditingCell(item._id, 'answer')" class="edit-container">
                  <textarea 
                    v-model="editingContent.text" 
                    class="edit-input"
                    @blur="finishEditing(item._id, 'answer')"
                    @keydown.enter.prevent="finishEditing(item._id, 'answer')"
                    ref="editTextarea"
                  ></textarea>
                </div>
                <div v-else>{{ item.answer }}</div>
              </td>
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
        <p>Are you sure you want to delete {{ getSelectedCount() }} selected item(s)?</p>
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
      cachedPages: {}, // Cache for page data: { pageNum: [...data] }
      lastSeenIds: {}, // Cache for lastSeenIds: { pageNum: lastSeenId }
      selectedIdsByPage: {}, // Track selections by page: { pageNum: [...selectedIds] }
      editedItems: {}, // Track edited items: { itemId: { question: '...', answer: '...' } }
      editingContent: {
        itemId: null,
        field: null,
        text: '',
        originalText: ''
      },
      loading: false,
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: 25,
      tenantPartitionKey: null,
      tempTenantKey: "",
      showDeleteModal: false,
      statusMessage: "",
      statusType: "info", // 'info', 'success', 'error'
      statusTimeout: null,
      cacheTimestamp: null, // When the cache was last refreshed
    };
  },

  computed: {
    allSelected() {
      return this.qaData.length > 0 && 
             this.selectedIdsByPage[this.currentPage] && 
             this.selectedIdsByPage[this.currentPage].length === this.qaData.length;
    },
  },

  watch: {
    // Update qaData whenever the page changes
    currentPage: {
      immediate: true,
      handler(newPage) {
        this.loadPageData(newPage);
      }
    }
  },

  methods: {
    submitTenantKey() {
      if (this.tempTenantKey.trim()) {
        this.tenantPartitionKey = this.tempTenantKey.trim();
        this.tempTenantKey = "";
        // Reset all states
        this.resetState();
        this.fetchData(1); // Fetch first page
      }
    },

    changeTenant() {
      this.tenantPartitionKey = null;
      this.resetState();
    },

    resetState() {
      this.qaData = [];
      this.cachedPages = {};
      this.lastSeenIds = {};
      this.selectedIdsByPage = {};
      this.editedItems = {};
      this.editingContent = {
        itemId: null,
        field: null,
        text: '',
        originalText: ''
      };
      this.currentPage = 1;
      this.totalPages = 0;
      this.totalItems = 0;
      this.cacheTimestamp = null;
    },

    // Load data from cache or fetch from server
    async loadPageData(pageNum) {
      if (!this.tenantPartitionKey) return;
      
      // If page exists in cache, use it
      if (this.cachedPages[pageNum]) {
        this.qaData = this.cachedPages[pageNum];
        // Initialize selection array for this page if needed
        if (!this.selectedIdsByPage[pageNum]) {
          this.selectedIdsByPage[pageNum] = [];
        }
        return;
      }
      
      // Otherwise, fetch from server
      await this.fetchData(pageNum);
    },

    // Refresh all data (clear cache and fetch first page)
    refreshData() {
      this.resetState();
      this.fetchData(1);
      this.showStatus("Data refreshed", "success");
    },

    async fetchData(pageNum) {
      if (!this.tenantPartitionKey) return;

      this.loading = true;

      try {
        let url = `http://localhost:8090/nexus/notebook/api/qapairs/mongodb?page=${pageNum}&pageSize=${this.pageSize}`;

        // Add lastSeenId parameter for pages beyond the first page
        if (pageNum > 1 && this.lastSeenIds[pageNum - 1]) {
          url += `&lastSeenId=${this.lastSeenIds[pageNum - 1]}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            tnt: this.tenantPartitionKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Update the current data
        this.qaData = data.data;
        this.totalPages = parseInt(data.totalPages);
        this.totalItems = parseInt(data.total);
        
        // Cache the retrieved data
        this.cachedPages[pageNum] = data.data;
        
        // Initialize selection array for this page if needed
        if (!this.selectedIdsByPage[pageNum]) {
          this.selectedIdsByPage[pageNum] = [];
        }
        
        // Update the lastSeenId for pagination
        if (this.qaData.length > 0) {
          this.lastSeenIds[pageNum] = this.qaData[this.qaData.length - 1]._id;
        }
        
        // Update cache timestamp
        this.cacheTimestamp = new Date();
      } catch (error) {
        console.error("Error fetching QA pairs:", error);
        this.qaData = [];
        this.showStatus("Failed to load data: " + error.message, "error");
      } finally {
        this.loading = false;
      }
    },

    toggleSelectAll() {
      if (!this.selectedIdsByPage[this.currentPage]) {
        this.selectedIdsByPage[this.currentPage] = [];
      }
      
      if (this.allSelected) {
        this.selectedIdsByPage[this.currentPage] = [];
      } else {
        this.selectedIdsByPage[this.currentPage] = this.qaData.map(item => item._id);
      }
    },

    confirmDeleteSelected() {
      if (this.getSelectedCount() > 0) {
        this.showDeleteModal = true;
      }
    },

    cancelDelete() {
      this.showDeleteModal = false;
    },

    // Get all selected IDs across all pages
    getAllSelectedIds() {
      let allSelectedIds = [];
      for (const pageNum in this.selectedIdsByPage) {
        allSelectedIds = [...allSelectedIds, ...this.selectedIdsByPage[pageNum]];
      }
      return allSelectedIds;
    },

    // Get total count of selected items
    getSelectedCount() {
      return this.getAllSelectedIds().length;
    },

    async deleteSelected() {
      this.showDeleteModal = false;
      this.loading = true;
      const selectedIds = this.getAllSelectedIds();

      try {
        const url = `http://localhost:8090/nexus/notebook/api/qapairs`;
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            tnt: this.tenantPartitionKey,
          },
          body: JSON.stringify({
            tenant_partition_key: this.tenantPartitionKey,
            del_ids: selectedIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`response del: ${JSON.stringify(data)}`);
        
        // Show success message
        this.showStatus(`Successfully deleted ${selectedIds.length} item(s)`, "success");
        
        // Clear cache and reload data
        this.resetState();
        this.fetchData(1);
      } catch (error) {
        console.error("Error deleting records:", error);
        this.showStatus("Failed to delete records: " + error.message, "error");
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

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    // Format cache status message
    getCacheStatus() {
      const pagesCount = Object.keys(this.cachedPages).length;
      let timeAgo = "";
      
      if (this.cacheTimestamp) {
        const seconds = Math.floor((new Date() - this.cacheTimestamp) / 1000);
        if (seconds < 60) {
          timeAgo = `${seconds} seconds ago`;
        } else if (seconds < 3600) {
          timeAgo = `${Math.floor(seconds / 60)} minutes ago`;
        } else {
          timeAgo = `${Math.floor(seconds / 3600)} hours ago`;
        }
      }
      
      return `${pagesCount} page(s) cached ${timeAgo}`;
    },
    
    // Start editing a cell
    startEditing(itemId, field) {
      // Get the current item from the data
      const item = this.qaData.find(item => item._id === itemId);
      if (!item) return;
      
      // Set up the editing state
      this.editingContent = {
        itemId: itemId,
        field: field,
        text: item[field],
        originalText: item[field]
      };
      
      // Focus the textarea after Vue updates the DOM
      this.$nextTick(() => {
        if (this.$refs.editTextarea) {
          const textarea = Array.isArray(this.$refs.editTextarea) 
            ? this.$refs.editTextarea[0] 
            : this.$refs.editTextarea;
          
          if (textarea) {
            textarea.focus();
            textarea.select();
          }
        }
      });
    },
    
    // Complete editing and save changes
    finishEditing(itemId, field) {
      // Make sure we're editing this item and field
      if (this.editingContent.itemId !== itemId || this.editingContent.field !== field) {
        return;
      }
      
      const newText = this.editingContent.text.trim();
      const originalText = this.editingContent.originalText.trim();
      
      // Only update if content changed
      if (newText !== originalText) {
        // Find item in the current data and update it
        const item = this.qaData.find(item => item._id === itemId);
        if (item) {
          item[field] = newText;
          
          // Update the item in cache as well
          Object.values(this.cachedPages).forEach(pageData => {
            const cachedItem = pageData.find(i => i._id === itemId);
            if (cachedItem) {
              cachedItem[field] = newText;
            }
          });
          
          // Track this item as edited
          if (!this.editedItems[itemId]) {
            this.editedItems[itemId] = {
              _id: itemId,
              question: item.question,
              answer: item.answer
            };
          } else {
            this.editedItems[itemId][field] = newText;
          }
        }
      }
      
      // Clear editing state
      this.editingContent = {
        itemId: null,
        field: null,
        text: '',
        originalText: ''
      };
    },
    
    // Check if we're currently editing a specific cell
    isEditingCell(itemId, field) {
      return this.editingContent.itemId === itemId && this.editingContent.field === field;
    },
    
    // Check if an item has been edited
    isItemEdited(itemId) {
      return !!this.editedItems[itemId];
    },
    
    // Get count of edited items
    getEditedCount() {
      return Object.keys(this.editedItems).length;
    },
    
    // Send all edited items to the update API
    async updateEditedItems() {
      if (this.getEditedCount() === 0) return;
      
      this.loading = true;
      const editedItemsArray = Object.values(this.editedItems);
      
      try {
        // This is where you would make your API call
        // For now, we'll just simulate a successful update
        console.log("Sending updated items to API:", editedItemsArray);
        
        // You would replace this with your actual API call:
        const response = await fetch('http://localhost:8090/nexus/notebook/api/qapairs', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'tnt': this.tenantPartitionKey
          },
          body: JSON.stringify({
            // tenant_partition_key: this.tenantPartitionKey,
            updateDocs : editedItemsArray
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        // Simulate a delay for the API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Show success message
        this.showStatus(`Successfully updated ${editedItemsArray.length} item(s)`, "success");
        
        // Clear edited items after successful update
        this.editedItems = {};
        this.refreshData();
      } catch (error) {
        console.error("Error updating records:", error);
        this.showStatus("Failed to update records: " + error.message, "error");
      } finally {
        this.loading = false;
      }
    }
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

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #27ae60;
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

.data-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cache-info {
  font-size: 14px;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 4px 10px;
  border-radius: 12px;
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

.qa-table tr.edited-row {
  background-color: #d4edff;
}

.qa-table tr.edited-row:hover {
  background-color: #c2e5ff;
}

.qa-table td {
  position: relative;
  cursor: pointer;
}

.qa-table td.editing {
  padding: 0;
  cursor: auto;
}

.edit-container {
  height: 100%;
  width: 100%;
}

.edit-input {
  width: 100%;
  height: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #3498db;
  resize: vertical;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
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

  .data-controls {
    width: 100%;
    justify-content: space-between;
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