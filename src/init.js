/**
 * Set new init lifecycle for Weex-x
 *
 * @param  {function} oriInit optional
 * @return {function}
 */
export function init (oriInit) {
  const hasInit = typeof oriInit === 'function'

  function xInit() {
    const { _options, _parent } = this

    // set $store from option or parent
    if (_options.store) {
      this.$store = _options.store
    }
    else {
      this.$store = _parent && _parent.$store
    }

    // run original init lifecycle if existed
    hasInit && oriInit.call(this)
  }

  // hack for call init directly in Vm
  if (this && this._options) {
    xInit.call(this)
  }

  return xInit
}
