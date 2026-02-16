import * as React from 'react';
import './BookingFilters.css';
import { BookingFilters as FiltersType } from '../../types';

interface BookingFiltersProps {
    filters: FiltersType;
    onFilterChange: (filters: FiltersType) => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ filters, onFilterChange }) => {
    const handleChange = (field: keyof FiltersType, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    // Set min and max dates
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="filtersCard">
            <div className="row g-3">
                <div className="col-12 col-md-3">
                    <div className="filterGroup">
                        <label className="label">Select Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            min={today}
                            max={maxDateStr}
                            onChange={(e) => handleChange('date', e.target.value)}
                            className="input"
                        />
                    </div>
                </div>

                <div className="col-12 col-md-3">
                    <div className="filterGroup">
                        <label className="label">Location</label>
                        <select
                            value={filters.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className="input"
                        >
                            <option value="all">All Locations</option>
                            <option value="Building A">Building A</option>
                            <option value="Building B">Building B</option>
                            <option value="Building C">Building C</option>
                        </select>
                    </div>
                </div>

                <div className="col-12 col-md-3">
                    <div className="filterGroup">
                        <label className="label">Floor</label>
                        <select
                            value={filters.floor}
                            onChange={(e) => handleChange('floor', e.target.value)}
                            className="input"
                        >
                            <option value="all">All Floors</option>
                            <option value="1">Floor 1</option>
                            <option value="2">Floor 2</option>
                            <option value="3">Floor 3</option>
                        </select>
                    </div>
                </div>

                <div className="col-12 col-md-3">
                    <div className="filterGroup">
                        <label className="label">Capacity</label>
                        <select
                            value={filters.capacity}
                            onChange={(e) => handleChange('capacity', e.target.value)}
                            className="input"
                        >
                            <option value="all">Any Capacity</option>
                            <option value="4">Up to 4 people</option>
                            <option value="8">Up to 8 people</option>
                            <option value="16">Up to 16 people</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingFilters;
