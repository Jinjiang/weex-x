export const threads = state => state.threads

export const threadList = state => {
  return Object.keys(state.threads).map(k => state.threads[k])
}

export const currentThread = state => {
  return state.currentThreadID
    ? state.threads[state.currentThreadID]
    : {}
}

export const currentMessages = state => {
  const thread = currentThread(state)
  return thread.messages
    ? thread.messages.map(id => state.messages[id])
    : []
}
