import Icon from './ui/Icon';

const Loading = ({ message = "جاري التحميل..." }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-400 border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg font-medium text-neutral-700">{message}</p>
            </div>
        </div>
    )
}

export default Loading
