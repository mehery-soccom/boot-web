import Vuex from 'vuex';
import Vue from 'vue';
import createPersistedState from "vuex-persistedstate";
import apiStore from './modules/apiStore';
import localStore from './modules/localStore';
import storage from 'local-storage-fallback';

// Load Vuex
Vue.use(Vuex);
// Create store
export default new Vuex.Store({
  modules: {
    apiStore,localStore
  },
  plugins: [createPersistedState({
    paths : ['localStore'],
    storage : {
        getItem: (key) => storage.getItem(key),
        setItem: (key, value) => storage.setItem(key, value),
        removeItem: (key) => storage.removeItem(key),
    }
  })]
});
