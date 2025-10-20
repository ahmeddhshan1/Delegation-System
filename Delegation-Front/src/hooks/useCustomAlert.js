import { useState } from 'react'

export const useCustomAlert = () => {
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'error'
    })

    const showAlert = (title, message, type = 'error') => {
        setAlertState({
            isOpen: true,
            title,
            message,
            type
        })
    }

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }))
    }

    const showSuccess = (title, message) => {
        showAlert(title, message, 'success')
    }

    const showError = (title, message) => {
        showAlert(title, message, 'error')
    }

    const showWarning = (title, message) => {
        showAlert(title, message, 'warning')
    }

    const showInfo = (title, message) => {
        showAlert(title, message, 'info')
    }

    return {
        alertState,
        showAlert,
        closeAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}
