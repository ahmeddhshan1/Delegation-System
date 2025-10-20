import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from '../store'
import Loading from './Loading'

const CustomPersistGate = ({ children }) => {
  return (
    <PersistGate 
      loading={<Loading message="جاري استعادة البيانات المحفوظة..." />} 
      persistor={persistor}
    >
      {children}
    </PersistGate>
  )
}

export default CustomPersistGate
