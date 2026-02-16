import * as React from 'react';
import { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 3000
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'info':
                return 'ℹ';
            default:
                return '✓';
        }
    };

    return (
        <div className={`toast ${type}`}>
            <span className="icon">{getIcon()}</span>
            <span className="message">{message}</span>
            <button className="closeBtn" onClick={onClose}>×</button>
        </div>
    );
};

export default Toast;
