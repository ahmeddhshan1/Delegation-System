import { useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

/**
 * Custom hook for components that need to react to specific WebSocket updates
 * @param {string|string[]} models - Model names to listen for (e.g., 'MainEvent', ['Member', 'Delegation'])
 * @param {function} callback - Function to call when updates are received
 * @param {array} deps - Dependencies array for the callback
 */
export const useWebSocketUpdates = (models, callback, deps = []) => {
    const { isConnected } = useWebSocket();

    useEffect(() => {
        if (!isConnected) return;

        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'stats_update' && data.model) {
                    const modelArray = Array.isArray(models) ? models : [models];
                    
                    if (modelArray.includes(data.model)) {
                        callback(data);
                    }
                }
            } catch (error) {
                console.error('Error in useWebSocketUpdates:', error);
            }
        };

        // Add event listener to window for global WebSocket messages
        window.addEventListener('websocket-message', handleWebSocketMessage);

        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage);
        };
    }, [isConnected, ...deps]);
};

/**
 * Hook for components that need to refresh data when specific models change
 * @param {string|string[]} models - Model names to listen for
 * @param {function} refreshFunction - Function to call to refresh data
 */
export const useWebSocketRefresh = (models, refreshFunction) => {
    useWebSocketUpdates(models, (data) => {
        refreshFunction();
    }, [refreshFunction]);
};

export default useWebSocketUpdates;
