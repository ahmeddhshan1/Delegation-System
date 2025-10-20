import { useEffect, useRef } from 'react'

/**
 * Hook للتحقق من أن المكون ما زال mounted قبل تحديث state
 * يمنع خطأ "Can't perform a React state update on a component that hasn't mounted yet"
 * 
 * @returns {boolean} isMounted - true إذا كان المكون mounted
 */
export const useMounted = () => {
    const isMounted = useRef(true)
    
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])
    
    return isMounted.current
}

/**
 * Hook للتحقق من mounted state مع callback
 * 
 * @param {Function} callback - الدالة المراد تنفيذها
 * @returns {Function} - دالة محمية من state updates على unmounted components
 */
export const useSafeCallback = (callback) => {
    const isMounted = useRef(true)
    
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])
    
    return (...args) => {
        if (isMounted.current) {
            return callback(...args)
        }
    }
}

export default useMounted
