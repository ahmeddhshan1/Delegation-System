import { Route, Routes } from 'react-router'
import Dashboard from '../layouts/Dashboard'
import Auth from '../layouts/Auth'
import Home from '../pages/Home'
import Login from '../pages/Auth/Login'
import DelegationMembers from '../pages/EDEX/EdexMembers'
import AllMembers from '../pages/AllMembers'
import EventsManagement from '../pages/Events/EventsManagement'
import EventPage from '../pages/EventPage/EventPage'
import SubEventPage from '../pages/SubEvent/SubEventPage'
import ProtectedRoute from '../components/Auth/ProtectedRoute'


const AppRouter = () => {
    return (
        <Routes>
            {/* صفحات المصادقة - غير محمية */}
            <Route element={<Auth />}>
                <Route path='login' element={<Login />} />
            </Route>
            
            {/* جميع الصفحات الأخرى محمية */}
            <Route path='/' element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            }>
                <Route index element={<Home />} />
                <Route path='/all-members' element={<AllMembers />} />
                <Route path='/events-management' element={<EventsManagement />} />
                <Route path='/:eventName/:subEventId/:delegationId' element={<DelegationMembers />} />
                <Route path='/:eventName/:subEventId' element={<SubEventPage />} />
                <Route path='/:eventName' element={<EventPage />} />
            </Route>
            
        </Routes>
    )
}

export default AppRouter