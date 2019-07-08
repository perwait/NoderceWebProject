import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex);

export default new Vuex.Store({
    strict : true,
    state : {
        asideData :null
    },
    mutations : {
        asideData(state,obj){
            state.asideData=obj; 
        }
    },
    actions: {
        asideData({commit},obj){
            commit("asideData",obj);
        }
    },
    getters : {
        asideData(state){
            return state.asideData;
        }
    },
    modules :{}

});