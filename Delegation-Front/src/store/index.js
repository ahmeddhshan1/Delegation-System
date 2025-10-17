import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { combineReducers } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import eventsSlice from './slices/eventsSlice'
import delegationsSlice from './slices/delegationsSlice'
import membersSlice from './slices/membersSlice'
import permissionsSlice from './slices/permissionsSlice'
import { 
  authPersistConfig, 
  permissionsPersistConfig, 
  eventsPersistConfig,
  delegationsPersistConfig,
  membersPersistConfig
} from './persistConfig'

// إنشاء reducers مع persistence
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice)
const persistedPermissionsReducer = persistReducer(permissionsPersistConfig, permissionsSlice)
const persistedEventsReducer = persistReducer(eventsPersistConfig, eventsSlice)
const persistedDelegationsReducer = persistReducer(delegationsPersistConfig, delegationsSlice)
const persistedMembersReducer = persistReducer(membersPersistConfig, membersSlice)

// دمج جميع الـ reducers
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  events: persistedEventsReducer,
  delegations: persistedDelegationsReducer,
  members: persistedMembersReducer,
  permissions: persistedPermissionsReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// إنشاء persistor
export const persistor = persistStore(store)

// Type exports moved to separate .d.ts file or use TypeScript file extension
