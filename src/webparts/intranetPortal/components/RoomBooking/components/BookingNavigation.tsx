import * as React from 'react';
import './BookingNavigation.css';
import { ViewType, UserRole } from '../types';

interface BookingNavigationProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
    userRole: string;
}

const BookingNavigation: React.FC<BookingNavigationProps> = ({
    activeView,
    onViewChange,
    userRole
}) => {
    const navItems = [
        { id: 'dashboard' as ViewType, label: 'Dashboard', icon: 'fa-chart-line' },
        { id: 'booking' as ViewType, label: 'Book Room', icon: 'fa-calendar-alt' },
        { id: 'mybookings' as ViewType, label: 'My Bookings', icon: 'fa-list' },
    ];

    if (userRole === UserRole.Admin) {
        navItems.push({ id: 'admin' as ViewType, label: 'Admin Panel', icon: 'fa-cog' });
    }

    return (
        <nav className="nav">
            <div className="rb-nav-wrapper">
                <div className="navItems">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`navItem ${activeView === item.id ? 'active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BookingNavigation;
