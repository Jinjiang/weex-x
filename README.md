# Weex-x

Flux-inspired-Architecture-Vuex-inspired-Architecture for Weex.

_note: this repo only works well with [`jinjiang/jsfm-feature-x`](https://github.com/jinjiang/weex/tree/jsfm-feature-x) branch of Weex_

## Install

```bash
npm install weex-x
```

## Usage

First you need to create a new `Store` with some options.

* `state`: the real JSON data work in the background.
* `getters`: you can define some getters whose value depends on the state.
* `mutations`: you can not modify the state directly but can define some mutations to dispatch anytime.
* `actions`: you can also define some functions to dispatch those mutations.

For example:

```javascript
import { Store } in 'weex-x'
const store = new Store({
  state: { firstName: 'Jinjiang', lastName: 'ZHAO' },
  getters: { fullName: state => `${state.firstName} ${state.lastName}` },
  mutations: {
    setFirstName (state, name) {
      state.firstName = name
    },
    setLastName (state, name) {
      state.lastName = name.toUpperCase()
    }
  },
  actions: {
    setFirstName: ({ commit }, payload) => commit('setFirstName', payload),
    setLastName: ({ commit }, payload) => commit('setLastName', payload),
    setFullName({ commit }, payload) {
      const result = payload.split(' ', 2)
      commit('setFirstName', result[0])
      commit('setLastName', result[1])
    }
  }
})
```

And then just set `store` to the *top* Vm options with the store you created and set `init` to *each* Vm options. You can access the store by `$store` in Vms.

```javascript
import { Store, init } in 'weex-x'
const store = new Store({...})
export {
  store, init,
  methods: {
    foo: function () {
      // this.$store
    }
  }
}
```

If your Vm already has `init` in its options. You can use it like this:

```javascript
import { Store, init } in 'weex-x'
const store = new Store({...})
export {
  store,
  init(function () {
    // todo
  })
}
```

At last you can quickly define more Vm options with some helpers:

```javascript
import { Store, init, mapGetters, mapActions } from 'weex-x'
const store = new Store({...})
export {
  store,
  init
}
export const computed = mapGetters([
  'firstName',
  'lastName',
  'fullName'
])
export const methods = mapActions([
  'setFirstName',
  'setLastName',
  'setFullName'
])
```

## Examples

See [examples](./examples/) for more.

## Contribution

* `npm run build` to build generated javascript code to `./dist/`
* `npm run dev` to watch the `./src/*` changes to run the build process
* `npm run test` to run test cases
* in `./examples/` you can `npm i && npm run build` to build all examples to `./examples/dist/`
* also in `./examples/` you can `npm run dev` to watch changes of all examples to run the build process
