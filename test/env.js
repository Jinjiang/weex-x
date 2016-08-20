import Vm from 'weex-js-framework/src/default/vm'

global.__weex_bootstrap__ = { Vm }
global.WXEnvironment = {}

console.debug = function () {}

export { Vm }
