import * as api from '@/api';

export default {

    namespaced: true,

    state: {
        inited: false,
        // 设置为null，方便我们去判断当前是首次获取还是获取到的是一个空数据
        boards: null
    },

    getters: {
        getBoard: ({boards}) => id => Array.isArray(boards) ? boards.find(board => board.id == id) : null
    },

    mutations: {
        updateBoards: (state, data) => {
            state.boards = data;
            state.inited = true;
        },
        updateBoard: (state, data) => {
            state.boards.forEach(item => {
                if(item.id === data.id) {
                    item.name = data.name;
                }
            });
        },
        addBoard: (state, data) => {
            if (state.boards === null) {
                state.boards = [];
            }
            state.boards = [...state.boards, data];
        },
        delBoard: (state, data) => {
            state.boards = state.boards.filter(board=>{
                return board.id !== data.id
        });
        }
    },

    actions: {
        getBoards: async ({commit}) => {

            try {
                let rs = await api.getBoards();

                commit('updateBoards', rs.data);

                return rs;
            } catch (e) {
                throw e;
            }

        },

        getBoard: async ({commit}, id) => {
            try {
                let rs = await api.getBoard(id);

                commit('addBoard', rs.data);

                return rs;
            } catch (e) {
                throw e;
            }
        },

        postBoard: async ({commit}, data) => {
            try {

                let rs = await api.postBoard(data);

                commit('addBoard', rs.data);

                return rs;

            } catch (e) {
                throw e;
            }
        },

        putBoard: async ({commit}, data) => {
            try {

                let rs = await api.putBoard(data);

                commit('updateBoard', data);

                return rs;

            } catch (e) {
                throw e;
            }
        },

        deleteBoard:async ({commit}, data) => {
            try {

                let rs = await api.delBoard(data);

                commit('delBoard', data);

                return rs;

            } catch (e) {
                throw e;
            }
        }

    }

}