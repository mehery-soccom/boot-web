//store/modules/auth.js

//import axios from "axios";

const state = {
  version : 0,
	api : {
  },
  rest : {
  }
};

const getters = {
	StateApi: (state) => state.api,
  StateRest: (state) => state.rest,
};

const actions = {
  async UPDATE_API_STORE({ commit },options) {
  	state.api[options.pathKey] = options.data;
  	await commit('SET_API_STORE',state.api);
  },
  async UPDATE_REST_STORE({ commit },options) {
  	state.rest[options.pathKey] = options.data;
  	await commit('UPDATE_REST_STORE',state.rest);
  },
};

const mutations = {
  SET_API_STORE(state, api) {
  	for(var key in api){
		  state.api[key] = api[key];
  	}
    state.api = {
      ... state.api, ...api
    };
  },
  UPDATE_REST_STORE(state, rest) {
  	for(var key in rest){
		  state.rest[key] = rest[key];
  	}
    state.rest = {
      ... state.rest, ...rest
    };
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
