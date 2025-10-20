import AddEvent from "./AddEvent"

const EmptyEvent = () => {
    return (
        <div className='flex flex-col gap-4 items-center py-18'>
            <img src="/images/event.png" width={128} alt="Event Image" />
            <div className="flex flex-col gap-1 items-center text-center">
                <h2 className="font-bold text-lg">لا يوجد معارض او احداث حتي الان</h2>
                <p className="text-neutral-600">
                    قم بأنشاء معرض او حدث و قم بأضافة البيانات الخاصة بالحدث بكل سهولة
                </p>
            </div>
            <AddEvent />
        </div>
    )
}


export default EmptyEvent