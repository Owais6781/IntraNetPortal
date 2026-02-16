import * as React from 'react';
import './DashboardStats.css';
import { DashboardStats as StatsType } from '../../types';

interface DashboardStatsProps {
    stats: StatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    const statCards = [
        {
            label: 'Total Rooms',
            value: stats.totalRooms,
            icon: 'fa-door-open',
            color: 'blue'
        },
        {
            label: "Today's Bookings",
            value: stats.todayBookings,
            icon: 'fa-calendar-check',
            color: 'green'
        },
        {
            label: 'Available Now',
            value: stats.availableNow,
            icon: 'fa-clock',
            color: 'yellow'
        },
        {
            label: 'Occupancy Rate',
            value: `${stats.occupancyRate}%`,
            icon: 'fa-percentage',
            color: 'purple'
        }
    ];

    return (
        <div className="row g-3 mb-4">
            {statCards.map((card, index) => (
                <div key={index} className="col-12 col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="content">
                            <div>
                                <p className="label">{card.label}</p>
                                <p className="value">{card.value}</p>
                            </div>
                            <div className={`iconWrapper ${card.color}`}>
                                <i className={`fas ${card.icon}`}></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
