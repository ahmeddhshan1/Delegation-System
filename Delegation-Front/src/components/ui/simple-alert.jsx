import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

const SimpleAlert = ({ 
    isOpen, 
    onClose, 
    title = "تنبيه", 
    message, 
    type = "error", // error, success, warning, info
    confirmText = "موافق"
}) => {
    if (!isOpen) return null

    const getIconAndColor = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'material-symbols:check-circle',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                }
            case 'warning':
                return {
                    icon: 'material-symbols:warning',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200'
                }
            case 'info':
                return {
                    icon: 'material-symbols:info',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                }
            default: // error
                return {
                    icon: 'material-symbols:error',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                }
        }
    }

    const { icon, color, bgColor, borderColor } = getIconAndColor()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={`relative bg-white rounded-lg shadow-xl border ${borderColor} max-w-md w-full mx-4`} dir="rtl">
                {/* Header */}
                <div className={`${bgColor} px-6 py-4 rounded-t-lg`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${bgColor}`}>
                            <Icon icon={icon} className={`text-xl ${color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                </div>
                
                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-gray-700 text-right">{message}</p>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                                type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                                type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SimpleAlert
