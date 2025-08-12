import React, { createContext, useContext } from 'react'
import RootStore from '../stores/RootStore'

const StoreContext = createContext<RootStore | null>(null)

interface StoreProviderProps {
  children: React.ReactNode
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const store = new RootStore()

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return store
}

export default StoreContext