import * as React from 'react';
import './BookingHeader.css';
import { User } from '../types';

interface BookingHeaderProps {
    currentUser: User;
    onToggleRole: () => void;
}

const BookingHeader: React.FC<BookingHeaderProps> = ({ currentUser, onToggleRole }) => {
    return (
        <header className="header">
            <div className="rb-header-wrapper">
                <div className="leftSection">
                    <div className="logo">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <h1 className="title">Meeting Room Manager</h1>
                    <span className="badge">SPFx</span>
                </div>
                <div className="rightSection">
                    <div className="userInfo">
                        <i className="fas fa-user-circle"></i>
                        <span>{currentUser.name}</span>
                        {currentUser.role === 'admin' && <span className="adminBadge">Admin</span>}
                    </div>
                    <button className="toggleBtn" onClick={onToggleRole}>
                        <i className="fas fa-exchange-alt"></i>
                        Switch Role
                    </button>
                </div>
            </div>
        </header>
    );
};

export default BookingHeader;
