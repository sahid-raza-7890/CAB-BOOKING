import { useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useRideSocket = (onRideUpdate) => {
    const socket = useContext(SocketContext);

    useEffect(() => {
        if (!socket) return;
        
        socket.on('rideUpdated', onRideUpdate);
        socket.on('rideAccepted', onRideUpdate);
        socket.on('rideStarted', onRideUpdate);
        socket.on('rideCompleted', onRideUpdate);
        socket.on('rideCancelled', onRideUpdate);
        
        return () => {
            socket.off('rideUpdated', onRideUpdate);
            socket.off('rideAccepted', onRideUpdate);
            socket.off('rideStarted', onRideUpdate);
            socket.off('rideCompleted', onRideUpdate);
            socket.off('rideCancelled', onRideUpdate);
        };
    }, [socket, onRideUpdate]);

    return socket;
};
