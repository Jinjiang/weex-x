import { Store } from '../../../../'

import * as actions from './actions'
import * as getters from './getters'
import cart from './modules/cart'
import products from './modules/products'

export default new Store({
  actions,
  getters,
  modules: {
    cart,
    products
  }
})
