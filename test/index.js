import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
const { expect } = chai
chai.use(sinonChai)

import { Vm } from './env'
import {
  Store,
  x,
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
})

describe('Weex-x install x()', () => {
  // todo
})

describe('Weex-x utils', () => {
  // todo
})
