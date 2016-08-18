/**
 * Hack init lifecycle of the Vm.
 *
 * @param  {object} options
 * @return {object}
 */
export function x (options) {
  const oriInit = options.init
  const hasInit = typeof oriInit === 'function'

  // set new init lifecycle
  options.init = function () {
    const opt = this._options
    const parent = this._parent || {}

    // set $store from option or parent
    if (opt.store) {
      this.$store = opt.store
    }
    else if (parent.$store) {
      this.$store = parent.$store
    }

    // run original init lifecycle if existed
    if (hasInit) {
      oriInit.call(this)
    }
  }

  return options
}
