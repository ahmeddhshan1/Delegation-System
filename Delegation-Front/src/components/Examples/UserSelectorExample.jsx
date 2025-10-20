import { useState } from 'react'
import UserSelector from '../ui/UserSelector'
import { Button } from '../ui/button'

const UserSelectorExample = () => {
    const [selectedUser, setSelectedUser] = useState('')

    const handleUserChange = (userId) => {
        setSelectedUser(userId)
        console.log('المستخدم المختار:', userId)
    }

    const handleSubmit = () => {
        if (selectedUser) {
            alert(`تم اختيار المستخدم: ${selectedUser}`)
        } else {
            alert('يرجى اختيار مستخدم')
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">مثال على اختيار المستخدمين</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        اختر مستخدم:
                    </label>
                    <UserSelector
                        value={selectedUser}
                        onValueChange={handleUserChange}
                        placeholder="اختر مستخدم من القائمة..."
                        showRole={true}
                    />
                </div>

                <div className="text-sm text-gray-600">
                    <p>المستخدم المختار: {selectedUser || 'لم يتم الاختيار'}</p>
                </div>

                <Button 
                    onClick={handleSubmit}
                    className="w-full"
                >
                    تأكيد الاختيار
                </Button>
            </div>
        </div>
    )
}

export default UserSelectorExample
