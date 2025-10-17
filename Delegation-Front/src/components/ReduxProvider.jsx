import { Provider } from 'react-redux'
import { store } from '../store'
import CustomPersistGate from './PersistGate'

const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <CustomPersistGate>
        {children}
      </CustomPersistGate>
    </Provider>
  )
}

export default ReduxProvider
