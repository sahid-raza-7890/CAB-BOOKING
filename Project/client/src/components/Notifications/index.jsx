import React from 'react';
import NotificationCenter from './NotificationCenter';

export default function Notifications({ isOpen, onClose }) {
    if (!isOpen) return null;
    return <NotificationCenter onClose={onClose} />;
}
