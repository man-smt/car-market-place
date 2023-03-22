import React, { ReactNode, createContext, useReducer } from 'react'

const initialState = {
  user: undefined,
}

const AppContext = createContext(initialState)
const { Provider } = AppContext

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.data }
    default:
      return {}
  }
}

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = { state, dispatch }
  return <Provider value={value}>{children}</Provider>
}

export { AppContext, AppProvider }
