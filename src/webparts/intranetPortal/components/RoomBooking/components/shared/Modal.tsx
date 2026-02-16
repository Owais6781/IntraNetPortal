import * as React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="header">
                    <h3 className="title">{title}</h3>
                    <button className="closeBtn" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="body">{children}</div>
                {footer && <div className="footer">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
