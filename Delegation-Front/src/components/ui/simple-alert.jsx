import React from 'react'
import Icon from './ui/Icon';

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
                    icon: 'CheckCircle',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                }
            case 'warning':
                return {
                    icon: 'AlertTriangle',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200'
                }
            case 'info':
                return {
                    icon: 'Info',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                }
            default: // error
                return {
                    icon: 'AlertCircle',
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
                            <Icon name={icon} size={20} className="text-xl ${color}" />
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
