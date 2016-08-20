import { Store } from '../../../'

// root state object.
// each Weex-x instance is just a single state tree.
const state = {
  count: 0
}

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  increment (state) {
    state.count++
  },
  decrement (state) {
    state.count--
  }
}

// getters are functions
const getters = {
  evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
}

// A Weex-x instance is created by combining the state, mutations,
// and getters.
export default new Store({
  state,
  getters,
  mutations
})
