import { Icon } from '@iconify/react/dist/iconify.js'
import { useNavigate } from 'react-router'

const Stats = ({delegationNum, militaryDelegationNum, civilDelegationNum, memebersNum}) => {
    const navigate = useNavigate()
    
    return (
        <div className='flex gap-2 justify-between'>
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1'>
                    <span className='text-neutral-600'>عدد الوفود</span>
                    <h2 className='text-sky-700 font-bold text-5xl'>{delegationNum}</h2>
                    <span className='text-neutral-400 text-xs'>
                        اخر تحديث منذ {new Date().toLocaleDateString()}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-sky-100 grid place-items-center'>
                    <Icon icon={'fa:globe'} fontSize={28} className='text-sky-600' />
                </div>
            </div>
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1'>
                    <span className='text-neutral-600'>عدد الوفود العسكرية</span>
                    <h2 className='text-orange-700 font-bold text-5xl'>{militaryDelegationNum}</h2>
                    <span className='text-neutral-400 text-xs'>
                        اخر تحديث منذ {new Date().toLocaleDateString()}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-orange-100 grid place-items-center'>
                    <Icon icon={'healthicons:officer'} fontSize={28} className='text-orange-600' />
                </div>
            </div>
            <div className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between'>
                <div className='flex flex-col gap-1'>
                    <span className='text-neutral-600'>عدد الوفود المدنية</span>
                    <h2 className='text-lime-700 font-bold text-5xl'>{civilDelegationNum}</h2>
                    <span className='text-neutral-400 text-xs'>
                        اخر تحديث منذ {new Date().toLocaleDateString()}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-lime-100 grid place-items-center'>
                    <Icon icon={'flowbite:user-solid'} fontSize={32} className='text-lime-600' />
                </div>
            </div>
            <div 
                className='box w-full bg-white p-6 rounded-2xl border border-neutral-300 flex items-center gap-2 justify-between cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => navigate('/all-members')}
            >
                <div className='flex flex-col gap-1'>
                    <span className='text-neutral-600'>عدد الاعضاء</span>
                    <h2 className='text-purple-700 font-bold text-5xl'>{memebersNum}</h2>
                    <span className='text-neutral-400 text-xs'>
                        اخر تحديث منذ {new Date().toLocaleDateString()}
                    </span>
                </div>
                <div className='w-12 h-12 rounded-full bg-purple-100 grid place-items-center'>
                    <Icon icon={'fa:users'} fontSize={28} className='text-purple-600' />
                </div>
            </div>
        </div>
    )
}

export default Stats