import React from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

const DeleteConfirm = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    title = "تأكيد الحذف",
    message = "هل أنت متأكد من الحذف؟",
    itemName = "",
    confirmText = "حذف",
    cancelText = "إلغاء"
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl border border-red-200 max-w-md w-full mx-4" dir="rtl">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100">
                            <Icon icon="material-symbols:delete" className="text-xl text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                </div>
                
                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-gray-700 text-right">
                        {message}
                        {itemName && (
                            <span className="font-semibold text-red-600 block mt-2">
                                "{itemName}"
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-gray-500 text-right mt-2">
                        هذا الإجراء لا يمكن التراجع عنه
                    </p>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirm
