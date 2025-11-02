import React from 'react';
import Icon from './ui/Icon';
import { useWebSocket } from '../contexts/WebSocketContext';
import { toast } from 'sonner';

const WebSocketStatus = ({ className = "" }) => {
    const { isConnected, connectionState, reconnect } = useWebSocket();

    const getStatusInfo = () => {
        switch (connectionState) {
            case 'CONNECTED':
                return {
                           icon: 'CheckCircle',
                    color: 'text-green-500',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-700',
                    text: 'متصل بالخادم - التحديثات المباشرة مفعلة'
                };
            case 'CONNECTING':
                return {
                           icon: 'Loader2',
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-700',
                    text: 'جاري الاتصال...'
                };
            case 'ERROR':
                return {
                           icon: 'AlertCircle',
                    color: 'text-red-500',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    text: 'خطأ في الاتصال'
                };
            case 'FAILED':
                return {
                           icon: 'XCircle',
                    color: 'text-red-500',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    text: 'فشل في الاتصال - انقر للمحاولة مرة أخرى'
                };
            default:
                return {
                           icon: 'XCircle',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-50',
                    textColor: 'text-gray-700',
                    text: 'غير متصل - التحديثات المباشرة معطلة'
                };
        }
    };

    const statusInfo = getStatusInfo();
    const isClickable = connectionState === 'FAILED' || connectionState === 'ERROR';

    const handleClick = () => {
        if (isClickable) {
            toast.info('جاري إعادة الاتصال...', {
                description: 'يرجى الانتظار',
                duration: 2000
            });
            reconnect();
        }
    };

    return (
        <div 
            className={`flex items-center gap-2 p-3 border rounded-lg ${statusInfo.bgColor} ${className} ${
                isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={handleClick}
            title={isClickable ? 'انقر للمحاولة مرة أخرى' : ''}
        >
            <Icon 
                name={statusInfo.icon} 
                size={20}
                className={`text-lg ${statusInfo.color} ${
                    connectionState === 'CONNECTING' ? 'animate-spin' : ''
                }`}
            />
            <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                {statusInfo.text}
            </span>
            {isClickable && (
                <Icon 
                    name="RefreshCw" 
                    size={16}
                    className="text-sm text-gray-500 ml-auto"
                />
            )}
        </div>
    );
};

export default WebSocketStatus;
