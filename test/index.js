import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
const { expect } = chai
chai.use(sinonChai)

import { Vm } from './env'
import {
  Store,
  init,
  mapState,
  mapMutations,
  mapGetters,
  mapActions
} from '../'

const TEST = 'TEST'
const TEST2 = 'TEST2'

describe('Weex-x Store', () => {
  it('committing mutations', () => {
    const store = new Store({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      }
    })
    store.commit(TEST, 2)
    expect(store.state.a).eql(3)
  })

  it('dispatching actions, sync', () => {
    const store = new Store({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          commit(TEST, n)
        }
      }
    })
    store.dispatch(TEST, 2)
    expect(store.state.a).eql(3)
  })

  it('dispatching actions, with returned Promise', done => {
    const store = new Store({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST, n)
              resolve()
            }, 0)
          })
        }
      }
    })
    expect(store.state.a).eql(1)
    store.dispatch(TEST, 2).then(() => {
      expect(store.state.a).eql(3)
      done()
    })
  })

  it.skip('composing actions with async/await', done => {
    const store = new Store({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST, n)
              resolve()
            }, 0)
          })
        },
        two: async ({ commit, dispatch }, n) => {
          await dispatch(TEST, 1)
          expect(store.state.a).eql(2)
          commit(TEST, n)
        }
      }
    })
    expect(store.state.a).eql(1)
    store.dispatch('two', 3).then(() => {
      expect(store.state.a).eql(5)
      done()
    })
  })

  it('detecting action Promise errors', done => {
    const store = new Store({
      actions: {
        [TEST] () {
          return new Promise((resolve, reject) => {
            reject('no')
          })
        }
      }
    })
    const spy = sinon.spy()
    store._devtoolHook = {
      emit: spy
    }
    const thenSpy = sinon.spy()
    store.dispatch(TEST)
      .then(thenSpy)
      .catch(err => {
        expect(thenSpy.notCalled).is.true
        expect(err).eql('no')
        expect(spy.calledOnce).is.true
        expect(spy.args[0]).eql(['weex-x:error', 'no'])
        done()
      })
  })

  it('getters', () => {
    const store = new Store({
      state: {
        a: 1
      },
      getters: {
        hasAny: state => state.a > 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        check ({ getters }, value) {
          // check for exposing getters into actions
          expect(getters.hasAny).eql(value)
        }
      }
    })
    expect(store.getters.hasAny).eql(false)
    store.dispatch('check', false)

    store.commit(TEST, 1)

    expect(store.getters.hasAny).eql(true)
    store.dispatch('check', true)
  })

  it('dynamic module registration', () => {
    const store = new Store({
      modules: {
        foo: {
          state: { bar: 1 },
          mutations: { inc: state => state.bar++ },
          actions: { incFoo: ({ commit }) => commit('inc') },
          getters: { bar: state => state.bar }
        }
      }
    })

    store.registerModule('hi', {
      state: { a: 1 },
      mutations: { inc: state => state.a++ },
      actions: { inc: ({ commit }) => commit('inc') },
      getters: { a: state => state.a }
    })

    expect(store._mutations.inc.length).eql(2)
    expect(store.state.hi.a).eql(1)
    expect(store.getters.a).eql(1)

    // assert initial modules work as expected after dynamic registration
    expect(store.state.foo.bar).eql(1)
    expect(store.getters.bar).eql(1)

    // test dispatching actions defined in dynamic module
    store.dispatch('inc')
    expect(store.state.hi.a).eql(2)
    expect(store.getters.a).eql(2)
    expect(store.state.foo.bar).eql(2)
    expect(store.getters.bar).eql(2)

    // unregister
    store.unregisterModule('hi')
    expect(store.state.hi).is.undefined
    expect(store.getters.a).is.undefined
    expect(store._mutations.inc.length).eql(1)
    expect(store._actions.inc).is.undefined

    // assert initial modules still work as expected after unregister
    store.dispatch('incFoo')
    expect(store.state.foo.bar).eql(3)
    expect(store.getters.bar).eql(3)
  })

  it('store injection', () => {
    const store = new Store()
    console.log(typeof init)
    const vm = new Vm('', {
      init,
      store
    })
    const child = new Vm('', { init }, vm)
    expect(child.$store).eql(store)
  })
})

describe('Weex-x modules', () => {
  it('module: mutation', function () {
    const mutations = {
      [TEST] (state, n) {
        state.a += n
      }
    }
    const store = new Store({
      state: {
        a: 1
      },
      mutations,
      modules: {
        nested: {
          state: { a: 2 },
          mutations,
          modules: {
            one: {
              state: { a: 3 },
              mutations
            },
            nested: {
              modules: {
                two: {
                  state: { a: 4 },
                  mutations
                },
                three: {
                  state: { a: 5 },
                  mutations
                }
              }
            }
          }
        },
        four: {
          state: { a: 6 },
          mutations
        }
      }
    })
    store.commit(TEST, 1)
    expect(store.state.a).eql(2)
    expect(store.state.nested.a).eql(3)
    expect(store.state.nested.one.a).eql(4)
    expect(store.state.nested.nested.two.a).eql(5)
    expect(store.state.nested.nested.three.a).eql(6)
    expect(store.state.four.a).eql(7)
  })

  it('module: action', function () {
    let calls = 0
    const makeAction = n => {
      return {
        [TEST] ({ state, rootState }) {
          calls++
          expect(state.a).eql(n)
          expect(rootState).eql(store.state)
        }
      }
    }
    const store = new Store({
      state: {
        a: 1
      },
      actions: makeAction(1),
      modules: {
        nested: {
          state: { a: 2 },
          actions: makeAction(2),
          modules: {
            one: {
              state: { a: 3 },
              actions: makeAction(3)
            },
            nested: {
              modules: {
                two: {
                  state: { a: 4 },
                  actions: makeAction(4)
                },
                three: {
                  state: { a: 5 },
                  actions: makeAction(5)
                }
              }
            }
          }
        },
        four: {
          state: { a: 6 },
          actions: makeAction(6)
        }
      }
    })
    store.dispatch(TEST)
    expect(calls).eql(6)
  })

  it('module: getters', function () {
    const makeGetter = n => ({
      [`getter${n}`]: (state, getters, rootState) => {
        expect(getters.constant).eql(0)
        expect(rootState).eql(store.state)
        return state.a
      }
    })
    const store = new Store({
      state: {
        a: 1
      },
      getters: {
        constant: () => 0,
        ...makeGetter(1)
      },
      modules: {
        nested: {
          state: { a: 2 },
          getters: makeGetter(2),
          modules: {
            one: {
              state: { a: 3 },
              getters: makeGetter(3)
            },
            nested: {
              modules: {
                two: {
                  state: { a: 4 },
                  getters: makeGetter(4)
                },
                three: {
                  state: { a: 5 },
                  getters: makeGetter(5)
                }
              }
            }
          }
        },
        four: {
          state: { a: 6 },
          getters: makeGetter(6)
        }
      }
    })
    ;[1, 2, 3, 4, 5, 6].forEach(n => {
      expect(store.getters[`getter${n}`]).eql(n)
    })
  })

  it('dispatching multiple actions in different modules', done => {
    const store = new Store({
      modules: {
        a: {
          actions: {
            [TEST] () {
              return 1
            }
          }
        },
        b: {
          actions: {
            [TEST] () {
              return new Promise(r => r(2))
            }
          }
        }
      }
    })
    store.dispatch(TEST).then(res => {
      expect(res[0]).eql(1)
      expect(res[1]).eql(2)
      done()
    })
  })
})

describe('Weex-x utils', () => {
  it('helper: mapState (array)', () => {
    const store = new Store({
      state: {
        a: 1
      }
    })
    const vm = new Vm('', {
      store,
      init,
      computed: mapState(['a'])
    })
    expect(vm.a).eql(1)
    store.state.a++
    expect(vm.a).eql(2)
  })

  it('helper: mapState (object)', () => {
    const store = new Store({
      state: {
        a: 1
      },
      getters: {
        b: () => 2
      }
    })
    const vm = new Vm('', {
      store,
      init,
      computed: mapState({
        a: (state, getters) => {
          return state.a + getters.b
        }
      })
    })
    expect(vm.a).eql(3)
    store.state.a++
    expect(vm.a).eql(4)
  })

  it('helper: mapMutations (array)', () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--
      }
    })
    const vm = new Vm('', {
      store,
      init,
      methods: mapMutations(['inc', 'dec'])
    })
    vm.inc()
    expect(store.state.count).eql(1)
    vm.dec()
    expect(store.state.count).eql(0)
  })

  it('helper: mapMutations (object)', () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--
      }
    })
    const vm = new Vm('', {
      store,
      init,
      methods: mapMutations({
        plus: 'inc',
        minus: 'dec'
      })
    })
    vm.plus()
    expect(store.state.count).eql(1)
    vm.minus()
    expect(store.state.count).eql(0)
  })

  it('helper: mapGetters (array)', () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--
      },
      getters: {
        hasAny: ({ count }) => count > 0,
        negative: ({ count }) => count < 0
      }
    })
    const vm = new Vm('', {
      store,
      init,
      computed: mapGetters(['hasAny', 'negative'])
    })
    expect(vm.hasAny).eql(false)
    expect(vm.negative).eql(false)
    store.commit('inc')
    expect(vm.hasAny).eql(true)
    expect(vm.negative).eql(false)
    store.commit('dec')
    store.commit('dec')
    expect(vm.hasAny).eql(false)
    expect(vm.negative).eql(true)
  })

  it('helper: mapGetters (object)', () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        inc: state => state.count++,
        dec: state => state.count--
      },
      getters: {
        hasAny: ({ count }) => count > 0,
        negative: ({ count }) => count < 0
      }
    })
    const vm = new Vm('', {
      store,
      init,
      computed: mapGetters({
        a: 'hasAny',
        b: 'negative'
      })
    })
    expect(vm.a).eql(false)
    expect(vm.b).eql(false)
    store.commit('inc')
    expect(vm.a).eql(true)
    expect(vm.b).eql(false)
    store.commit('dec')
    store.commit('dec')
    expect(vm.a).eql(false)
    expect(vm.b).eql(true)
  })

  it('helper: mapActions (array)', () => {
    const a = sinon.spy()
    const b = sinon.spy()
    const store = new Store({
      actions: {
        a,
        b
      }
    })
    const vm = new Vm('', {
      store,
      init,
      methods: mapActions(['a', 'b'])
    })
    vm.a()
    expect(a.calledOnce).is.true
    expect(b.notCalled).is.true
    vm.b()
    expect(b.calledOnce).is.true
  })

  it('helper: mapActions (object)', () => {
    const a = sinon.spy()
    const b = sinon.spy()
    const store = new Store({
      actions: {
        a,
        b
      }
    })
    const vm = new Vm('', {
      store,
      init,
      methods: mapActions({
        foo: 'a',
        bar: 'b'
      })
    })
    vm.foo()
    expect(a.calledOnce).is.true
    expect(b.notCalled).is.true
    vm.bar()
    expect(b.calledOnce).is.true
  })
})

describe('Weex-x install init()', () => {
  it('generate options', () => {
    function Obj (options, parent) {
      this._options = options
      this._parent = parent
      options.init && options.init.call(this)
    }
    const oriInit = sinon.spy()
    const store = { a: 1 }
    const options = {
      store,
      init: init(oriInit)
    }

    const target = new Obj(options)

    expect(oriInit.calledOnce).is.true
    expect(target.$store).eql(store)
  })
})
