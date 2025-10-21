// خدمة API للتواصل مع الباك إند
import axios from 'axios'

// Dynamic API base URL - will use LAN IP when available, fallback to localhost
const getApiBaseUrl = () => {
    // Check if we're running on LAN (not localhost)
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8000/api`;
    }
    return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// إنشاء instance من axios مع الإعدادات الافتراضية
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor لإضافة token للمصادقة
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Token ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // إذا انتهت صلاحية الـ token
            localStorage.removeItem('authToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// خدمة الأحداث
export const eventService = {
    // جلب جميع الأحداث الرئيسية
    async getMainEvents() {
        const response = await api.get('/main-events/')
        return normalizeList(response.data)
    },

    // إنشاء حدث رئيسي جديد
    async createMainEvent(eventData) {
        const response = await api.post('/main-events/', eventData)
        return response.data
    },

    // تحديث حدث رئيسي
    async updateMainEvent(id, eventData) {
        const response = await api.patch(`/main-events/${id}/`, eventData)
        return response.data
    },

    // حذف حدث رئيسي
    async deleteMainEvent(id) {
        await api.delete(`/main-events/${id}/`)
    },

    // جلب الأحداث الفرعية
    async getSubEvents(mainEventId = null) {
        const params = mainEventId ? { main_event_id: mainEventId } : {}
        const response = await api.get('/sub-events/', { params })
        return normalizeList(response.data)
    },

    // إنشاء حدث فرعي جديد
    async createSubEvent(subEventData) {
        const response = await api.post('/sub-events/', subEventData)
        return response.data
    },

    // تحديث حدث فرعي
    async updateSubEvent(id, subEventData) {
        const response = await api.patch(`/sub-events/${id}/`, subEventData)
        return response.data
    },

    // حذف حدث فرعي
    async deleteSubEvent(id) {
        await api.delete(`/sub-events/${id}/`)
    },
}

// خدمة الوفود
export const delegationService = {
    // جلب جميع الوفود
    async getDelegations(filters = {}) {
        const response = await api.get('/delegations/', { params: filters })
        return normalizeList(response.data)
    },

    // جلب وفد محدد
    async getDelegation(id) {
        const response = await api.get(`/delegations/${id}/`)
        return response.data
    },

    // إنشاء وفد جديد
    async createDelegation(delegationData) {
        const response = await api.post('/delegations/', delegationData)
        return response.data
    },

    // تحديث وفد
    async updateDelegation(id, delegationData) {
        const response = await api.patch(`/delegations/${id}/`, delegationData)
        return response.data
    },

    // حذف وفد
    async deleteDelegation(id) {
        await api.delete(`/delegations/${id}/`)
    },
}

// خدمة الأعضاء
export const memberService = {
    // جلب جميع الأعضاء
    async getMembers(filters = {}) {
        const response = await api.get('/members/', { params: filters })
        return normalizeList(response.data)
    },

    // جلب عضو محدد
    async getMember(id) {
        const response = await api.get(`/members/${id}/`)
        return response.data
    },

    // إنشاء عضو جديد
    async createMember(memberData) {
        const response = await api.post('/members/', memberData)
        return response.data
    },

    // تحديث عضو
    async updateMember(id, memberData) {
        const response = await api.patch(`/members/${id}/`, memberData)
        return response.data
    },

    // حذف عضو
    async deleteMember(id) {
        await api.delete(`/members/${id}/`)
    },
}

// خدمة الجنسيات
export const nationalityService = {
    // جلب جميع الجنسيات
    async getNationalities() {
        const response = await api.get('/nationalities/')
        return normalizeList(response.data)
    },

    // إنشاء جنسية جديدة
    async createNationality(nationalityData) {
        const response = await api.post('/nationalities/', nationalityData)
        return response.data
    },

    // تحديث جنسية
    async updateNationality(id, nationalityData) {
        const response = await api.patch(`/nationalities/${id}/`, nationalityData)
        return response.data
    },

    // حذف جنسية
    async deleteNationality(id) {
        await api.delete(`/nationalities/${id}/`)
    },
}

// خدمة المدن
export const citiesService = {
    // جلب جميع المدن
    async getCities() {
        const response = await api.get('/cities/')
        return normalizeList(response.data)
    },
    // إنشاء مدينة جديدة
    async createCity(cityData) {
        const response = await api.post('/cities/', cityData)
        return response.data
    },
    // حذف مدينة
    async deleteCity(id) {
        await api.delete(`/cities/${id}/`)
    },
}

// خدمة المناصب العسكرية
export const militaryPositionService = {
    // جلب جميع المناصب العسكرية
    async getMilitaryPositions() {
        const response = await api.get('/military-positions/')
        return normalizeList(response.data)
    },

    // إنشاء منصب عسكري جديد
    async createMilitaryPosition(positionData) {
        const response = await api.post('/military-positions/', positionData)
        return response.data
    },

    // تحديث منصب عسكري
    async updateMilitaryPosition(id, positionData) {
        const response = await api.patch(`/military-positions/${id}/`, positionData)
        return response.data
    },

    // حذف منصب عسكري
    async deleteMilitaryPosition(id) {
        await api.delete(`/military-positions/${id}/`)
    },
}

// خدمة الوظائف المعادلة
export const equivalentJobService = {
    // جلب جميع الوظائف المعادلة
    async getEquivalentJobs() {
        const response = await api.get('/equivalent-jobs/')
        return normalizeList(response.data)
    },

    // إنشاء وظيفة معادلة جديدة
    async createEquivalentJob(jobData) {
        const response = await api.post('/equivalent-jobs/', jobData)
        return response.data
    },

    // تحديث وظيفة معادلة
    async updateEquivalentJob(id, jobData) {
        const response = await api.patch(`/equivalent-jobs/${id}/`, jobData)
        return response.data
    },

    // حذف وظيفة معادلة
    async deleteEquivalentJob(id) {
        await api.delete(`/equivalent-jobs/${id}/`)
    },
}

// خدمة المطارات
export const airportService = {
    // جلب جميع المطارات
    async getAirports() {
        const response = await api.get('/airports/')
        return normalizeList(response.data)
    },

    // إنشاء مطار جديد
    async createAirport(airportData) {
        const response = await api.post('/airports/', airportData)
        return response.data
    },

    // تحديث مطار
    async updateAirport(id, airportData) {
        const response = await api.patch(`/airports/${id}/`, airportData)
        return response.data
    },

    // حذف مطار
    async deleteAirport(id) {
        await api.delete(`/airports/${id}/`)
    },
}

// خدمة الخطوط الجوية
export const airlineService = {
    // جلب جميع الخطوط الجوية
    async getAirlines() {
        const response = await api.get('/airlines/')
        return normalizeList(response.data)
    },

    // إنشاء خط جوي جديد
    async createAirline(airlineData) {
        const response = await api.post('/airlines/', airlineData)
        return response.data
    },

    // تحديث خط جوي
    async updateAirline(id, airlineData) {
        const response = await api.patch(`/airlines/${id}/`, airlineData)
        return response.data
    },

    // حذف خط جوي
    async deleteAirline(id) {
        await api.delete(`/airlines/${id}/`)
    },
}

// خدمة جلسات المغادرة
export const departureSessionService = {
    // جلب جميع جلسات المغادرة
    async getDepartureSessions(filters = {}) {
        const response = await api.get('/check-outs/', { params: filters })
        return normalizeList(response.data)
    },

    // إنشاء جلسة مغادرة جديدة
    async createDepartureSession(sessionData) {
        const response = await api.post('/check-outs/', sessionData)
        return response.data
    },

    // تحديث جلسة مغادرة
    async updateDepartureSession(id, sessionData) {
        const response = await api.patch(`/check-outs/${id}/`, sessionData)
        return response.data
    },

    // حذف جلسة مغادرة
    async deleteDepartureSession(id) {
        await api.delete(`/check-outs/${id}/`)
    },
}

// خدمة لوحة التحكم
export const dashboardService = {
    // جلب إحصائيات لوحة التحكم
    async getStats() {
        const response = await api.get('/dashboard/stats/')
        return response.data
    },
}

// خدمة المستخدمين
export const userService = {
    // جلب معلومات المستخدم الحالي
    async getCurrentUser() {
        const response = await api.get('/auth/me/')
        return response.data
    },
    
    // جلب جميع المستخدمين (للدروب داون)
    async getUsers(filters = {}) {
        const response = await api.get('/users/', { params: filters })
        return normalizeList(response.data)
    },
    
    // جلب مستخدم محدد
    async getUser(id) {
        const response = await api.get(`/users/${id}/`)
        return response.data
    },
    
    // جلب صلاحيات المستخدم
    async getUserPermissions() {
        const response = await api.get('/auth/user_permissions/')
        return response.data
    },
    
    // التحقق من صلاحية محددة
    async checkPermission(permission) {
        const response = await api.get(`/auth/check_permission/?permission=${permission}`)
        return response.data
    },
    
    // جلب الأحداث الرئيسية (للـ SideBar)
    async getMainEvents() {
        const response = await api.get('/main-events/')
        return normalizeList(response.data)
    },
}

export default api

// Helper: توحيد مخرجات القوائم (Arrays)
function normalizeList(data) {
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data)) return data
    return []
}
