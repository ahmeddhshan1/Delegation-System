import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

// Import all Redux actions that need to be triggered
import { fetchMainEvents, fetchSubEvents } from '../store/slices/eventsSlice';
import { fetchDelegations, fetchDepartureSessions } from '../store/slices/delegationsSlice';
import { fetchAllMembers, fetchMembers } from '../store/slices/membersSlice';
import { fetchStats } from '../store/slices/statsSlice';
import { fetchNationalities } from '../store/slices/nationalitiesSlice';
import { fetchCities } from '../store/slices/citiesSlice';
import { fetchAirlines } from '../store/slices/airlinesSlice';
import { fetchAirports } from '../store/slices/airportsSlice';
import { fetchEquivalentJobs } from '../store/slices/equivalentJobsSlice';

const WebSocketContext = createContext();

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('DISCONNECTED');
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // WebSocket URL
    const getWebSocketUrl = () => {
        return import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/updates/';
    };

    // Show toast notification for model updates
    const showUpdateToast = (data) => {
        const { model, action, id } = data;
        
        const modelNames = {
            'MainEvent': 'الحدث الرئيسي',
            'SubEvent': 'الحدث الفرعي',
            'Delegation': 'الوفد',
            'Member': 'العضو',
            'CheckOut': 'جلسة المغادرة',
            'Nationality': 'الجنسية',
            'Cities': 'المدينة',
            'AirLine': 'الخط الجوي',
            'AirPort': 'المطار',
            'EquivalentJob': 'الوظيفة المكافئة'
        };

        const actionNames = {
            'created': 'تم إنشاء',
            'updated': 'تم تحديث',
            'deleted': 'تم حذف'
        };

        const modelName = modelNames[model] || model;
        const actionName = actionNames[action] || action;
        
        const message = `${actionName} ${modelName} بنجاح`;
        
        // Show different toast types based on action
        switch (action) {
            case 'created':
                toast.success(message, {
                    description: `تم إضافة ${modelName} جديد إلى النظام`,
                    duration: 4000
                });
                break;
            case 'updated':
                toast.info(message, {
                    description: `تم تعديل بيانات ${modelName} بنجاح`,
                    duration: 4000
                });
                break;
            case 'deleted':
                toast.warning(message, {
                    description: `تم حذف ${modelName} من النظام`,
                    duration: 4000
                });
                break;
            default:
                toast.info(message, {
                    duration: 3000
                });
        }
    };

    // Handle different model updates
    const handleModelUpdate = (data) => {
        const { model, action, id } = data;

        // Show toast notification
        showUpdateToast(data);

        switch (model) {
            case 'MainEvent':
                dispatch(fetchMainEvents());
                dispatch(fetchStats());
                break;

            case 'SubEvent':
                dispatch(fetchSubEvents());
                dispatch(fetchStats());
                break;

            case 'Delegation':
                dispatch(fetchDelegations());
                dispatch(fetchStats());
                break;

            case 'Member':
                dispatch(fetchAllMembers());
                dispatch(fetchStats());
                // If we're on a specific delegation page, also fetch that delegation's members
                const currentPath = window.location.pathname;
                const delegationMatch = currentPath.match(/\/edex\/([^\/]+)\/([^\/]+)/);
                if (delegationMatch) {
                    const delegationId = delegationMatch[2];
                    dispatch(fetchMembers(delegationId));
                }
                break;

            case 'CheckOut':
                dispatch(fetchDepartureSessions());
                dispatch(fetchStats());
                dispatch(fetchAllMembers());
                dispatch(fetchDelegations());
                break;

            case 'Nationality':
                dispatch(fetchNationalities());
                // Also refresh delegations and members that use nationalities
                dispatch(fetchDelegations());
                dispatch(fetchAllMembers());
                break;

            case 'Cities':
                dispatch(fetchCities());
                // Also refresh delegations and members that use cities
                dispatch(fetchDelegations());
                dispatch(fetchAllMembers());
                break;

            case 'AirLine':
                dispatch(fetchAirlines());
                // Also refresh delegations and members that use airlines
                dispatch(fetchDelegations());
                dispatch(fetchAllMembers());
                break;

            case 'AirPort':
                dispatch(fetchAirports());
                // Also refresh delegations and members that use airports
                dispatch(fetchDelegations());
                dispatch(fetchAllMembers());
                break;

            case 'EquivalentJob':
                dispatch(fetchEquivalentJobs());
                // Also refresh members that use equivalent jobs
                dispatch(fetchAllMembers());
                break;

            default:
                // For unknown models, just refresh stats
                dispatch(fetchStats());
        }
    };

    // Connect to WebSocket
    const connectWebSocket = () => {
        if (!isMountedRef.current) return;

        const wsUrl = getWebSocketUrl();

        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                if (!isMountedRef.current) return;
                setIsConnected(true);
                setConnectionState('CONNECTED');
                // reconnectAttemptsRef.current = 0;
                
                // // Show connection success toast (only if it was previously disconnected)
                // if (reconnectAttemptsRef.current > 0) {
                //     toast.success('تم إعادة الاتصال بالخادم', {
                //         description: 'التحديثات المباشرة مفعلة مرة أخرى',
                //         duration: 3000
                //     });
                // } else {
                //     toast.success('تم الاتصال بالخادم', {
                //         description: 'التحديثات المباشرة مفعلة الآن',
                //         duration: 3000
                //     });
                // }
            };

            wsRef.current.onmessage = (event) => {
                if (!isMountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);

                    // Emit custom event for other components to listen to
                    window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));

                    // Handle different message types
                    if (data.type === 'stats_update' && data.model) {
                        handleModelUpdate(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onerror = (error) => {
                if (!isMountedRef.current) return;
                setIsConnected(false);
                setConnectionState('ERROR');
            };

            wsRef.current.onclose = (event) => {
                if (!isMountedRef.current) return;
                setIsConnected(false);
                setConnectionState('DISCONNECTED');

                // Show disconnection toast
                // if (event.code !== 1000) { // Not a normal closure
                //     toast.error('انقطع الاتصال بالخادم', {
                //         description: 'جاري محاولة إعادة الاتصال...',
                //         duration: 4000
                //     });
                // }

                // Attempt to reconnect if not a normal closure
                if (event.code !== 1000 && isMountedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            connectWebSocket();
                        }
                    }, 3000 * reconnectAttemptsRef.current); // Exponential backoff
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    setConnectionState('FAILED');
                    toast.error('فشل في الاتصال', {
                        description: 'تم استنفاد محاولات إعادة الاتصال. يرجى تحديث الصفحة',
                        duration: 6000
                    });
                }
            };

        } catch (error) {
            setIsConnected(false);
            setConnectionState('ERROR');
        }
    };

    // Send message to WebSocket
    const sendMessage = (message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    };

    // Manual reconnect
    const reconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectAttemptsRef.current = 0;
        
        toast.info('جاري إعادة الاتصال...', {
            description: 'يرجى الانتظار',
            duration: 2000
        });
        
        connectWebSocket();
    };

    // Initialize WebSocket connection
    useEffect(() => {
        isMountedRef.current = true;
        connectWebSocket();

        return () => {
            isMountedRef.current = false;
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
            }
        };
    }, []);

    const value = {
        isConnected,
        connectionState,
        sendMessage,
        reconnect
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
