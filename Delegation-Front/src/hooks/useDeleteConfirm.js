import { useState } from 'react'

export const useDeleteConfirm = () => {
    const [deleteState, setDeleteState] = useState({
        isOpen: false,
        title: '',
        message: '',
        itemName: '',
        onConfirm: null
    })

    const showDeleteConfirm = (title, message, itemName, onConfirm) => {
        setDeleteState({
            isOpen: true,
            title,
            message,
            itemName,
            onConfirm
        })
    }

    const closeDeleteConfirm = () => {
        setDeleteState(prev => ({ ...prev, isOpen: false }))
    }

    const confirmDelete = () => {
        if (deleteState.onConfirm) {
            deleteState.onConfirm()
        }
        closeDeleteConfirm()
    }

    return {
        deleteState,
        showDeleteConfirm,
        closeDeleteConfirm,
        confirmDelete
    }
}
