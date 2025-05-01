<template>
  <div>
    <header class="app-header">
      <h1>QA Pairs Management</h1>
      <nav class="app-nav">
        <router-link to="/explore">Qa pairs explorer</router-link>
        <router-link to="/createDocs">Create Qa Pairs</router-link>
      </nav>
    </header>
    <router-view></router-view>
    <footer class="app-footer">
      <p>&copy; 2025 - Vector Database Explorer</p>
    </footer>
  </div>  
</template>

<script>
// import QAPairsTable from './Modules/QAPairsTable.vue';
// import CreateDocs from './Modules/CreateDocs.vue';
export default {
  name: 'App',
  // components: {
  //   QAPairsTable,
  //   CreateDocs
  // },
  // data() {
  //   return {
  //     activeTab: 'explorer'
  //   }
  // }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
<style scoped>
/* General layout */
div {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header styles */
.app-header {
  background-color: #1e1e2f;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

/* Navigation styles */
.app-nav {
  display: flex;
  gap: 1rem;
}

.app-nav a {
  color: #c0c0ff;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.app-nav a:hover {
  color: #ffffff;
}

/* Router view container */
router-view {
  flex: 1;
  padding: 2rem;
}

/* Footer styles */
.app-footer {
  background-color: #1e1e2f;
  color: #ccc;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.9rem;
}
</style>
