import * as React from "react";
import "./Admin.css";
import { SPFI } from "@pnp/sp";
import { useState, useEffect } from "react";


interface IAdminPageProps {
    sp: SPFI;
}

interface IMeetingRoom {
    ID: number;
    Title: string;
    Location: string;
    Floor: string;
    Capacity: string;
    Extension: string;
    Status?: string;
}

interface IBookingRules {
    ID: number;
    Title: string;
    Rules: string;
    TimeLimit: string;
}

interface IOfficeTime {
    ID: number;
    WeekDaysStartTime: string;
    WeekDaysEndTime: string;
    WeekendStatus: string;
    Status: string;
}

interface Mapping {
    ID: number;
    Title: string;
    Floor: string;
    Capacity:string;
    Status: string;
}

interface INewRoom {
    Title: string;
    Location: string;
    Floor: string;
    Facilities: string;
    Capacity: string;
    Extension: string;
    Status: string;
}

const AdminPage: React.FC<IAdminPageProps> = ({ sp }) => {
    const [rooms, setRooms] = useState<IMeetingRoom[]>([]);
    const [bookingRules, setBookingRules] = useState<IBookingRules[]>([]);
    const [officeHour, setOfficeHour] = useState<IOfficeTime[]>([]);
    const [mapping, setMapping] = useState<Mapping[]>([]);

    const [showForm, setShowForm] = useState<boolean>(false);

    const [newRoom, setNewRoom] = useState<INewRoom>({
        Title: "",
        Location: "",
        Floor: "",
        Facilities: "",
        Capacity: "",
        Extension: "",
        Status: "Active"
    });

    const loadRooms = async (): Promise<void> => {
        const items = await sp.web.lists
            .getByTitle("MeetingRooms")
            .items.select("ID", "Title", "Location", "Floor", "Capacity", "Extension", "Status")
            .filter("Status eq 'Active'")();

        setRooms(items);
    };

    const loadRules = async (): Promise<void> => {
        const rules = await sp.web.lists
            .getByTitle("MeetingRoomBookingRules")
            .items.select("ID", "Title", "Rules", "TimeLimit", "Status")
            .filter("Status eq 'Active'")();

        setBookingRules(rules);
    };

    const loadOfficeTime = async (): Promise<void> => {
        const Time = await sp.web.lists
            .getByTitle("MeetingRoomOfficeHour")
            .items.select("ID", "Title", "WeekDaysStartTime", "WeekDaysEndTime", "WeekendStatus")
            .filter("Title eq 'Active'")();

        setOfficeHour(Time)
    };

    const loadmapping = async (): Promise<void> => {
        const data = await sp.web.lists
            .getByTitle("MeetingRoomMasterList")
            .items.select("ID", "Title", "Floor","Capacity", "Status")
            .filter("Status eq 'Active'")();

        setMapping(data);
    };

    useEffect(() => {
        void loadRooms();
        void loadRules();
        void loadOfficeTime();
        void loadmapping();
    }, []);


    const handleChange = (field: keyof INewRoom, value: string): void => {
        setNewRoom(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const SaveRoom = async (): Promise<void> => {
       await sp.web.lists
            .getByTitle("MeetingRooms")
            .items.add({
                Title: newRoom.Title,
                Location: newRoom.Location,
                Floor: newRoom.Floor,
                Facilities: newRoom.Facilities,
                Capacity: newRoom.Capacity,
                Extension: newRoom.Extension,
                Status: "Active"
            });

        setShowForm(false);
        await loadRooms();
    };

    const DeleteRoom = async(ID:number): Promise<void> => {
        await sp.web.lists
        .getByTitle("MeetingRooms")
        .items.getById(ID)
        .update({
            Status:"InActive"
        });

        await loadRooms();
    };


    return (
        <div className="adminWrapper">
            <div className="adminHeader">
                <div className="adminContent">
                    <h1>Admin Panel</h1>
                    <p>Manage rooms, settings, and system configuration</p>
                </div>

                <button className="NewRoomButton"
                    onClick={() => (setShowForm(true))}>
                    + Add New Room
                </button>
            </div>

            <div className="tableCard">
                <h2>Meeting Rooms</h2>

                <table className="roomsTable">
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Location</th>
                            <th>Floor</th>
                            <th>Capacity</th>
                            <th>Extension</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.ID}>
                                <td>
                                    <div className="roomCell">
                                        <span className="roomName">{room.Title}</span>
                                    </div>
                                </td>
                                <td className="locationText">{room.Location}</td>
                                <td className="floorText"> {room.Floor}</td>
                                <td className="capacityText">{room.Capacity}</td>
                                <td className="extensionText">{room.Extension}</td>
                                <td>
                                    <span className={`statusBadge ${room.Status === 'Active' ? 'statusActive' : 'statusInactive'}`}>
                                        {room.Status || 'Active'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actionsCell">
                                        <button className="actionButton editButton" title="Edit">
                                            ✏️
                                        </button>
                                        <button className="actionButton deleteButton" title="Delete"
                                        onClick={() => DeleteRoom(room.ID)}>
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="RulesContainer">
                <div className="RulesCard">
                    <div className="RulesCardHeader">
                        <div className="RulesIcon">🔔</div>
                        <h3>Booking Rules</h3>
                    </div>

                    {bookingRules.map((rule) => (
                        <div key={rule.ID} className="RulesItem">
                            <div className="RulesLabel">
                                <div className="RulesTitle">{rule.Title}</div>
                                <div className="RulesDescription">{rule.Rules}</div>
                            </div>

                            <div className="RulesValue">{rule.TimeLimit}</div>
                        </div>
                    ))}
                </div>

                <div className="RulesCard">
                    <div className="RulesCardHeader">
                        <div className="RulesIcon">🕐</div>
                        <h3> Business Hours</h3>
                    </div>
                    {officeHour.map((timing) => (
                        <div key={timing.ID}>
                            <div className="OfficeHourTime">
                                <div className="DayLabel">
                                    <span>Weekdays</span>
                                    <span className="timeRange">
                                        {timing.WeekDaysStartTime} - {timing.WeekDaysEndTime}
                                    </span>
                                </div>
                                <div className="timeBar">
                                    <div className="timeBarFilled"></div>
                                </div>
                            </div>

                            <div className="OfficeHourTime">
                                <div className="DayLabel">
                                    <span>Weekends</span>
                                    <span className="timeRange closed">{timing.WeekendStatus}</span>
                                </div>
                                <div className="timeBar">
                                    <div className="timeBarEmpty"></div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {showForm && (
                <div className="formOverlay">
                    <div className="formContent">
                        <div className="formHeader">
                            <h2>Add New Room</h2>

                            <button className="closeButton"
                                onClick={() => setShowForm(false)}>
                                ×
                            </button>
                        </div>

                        <div className="formBody">
                            <div className="formGroup">
                                <label>Room Name</label>
                                <input className="formInput"
                                    type="text"
                                    placeholder="e.g.Innovation Room"
                                    value={newRoom.Title}
                                    onChange={(e) => handleChange("Title", e.target.value)}
                                     />
                            </div>

                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Location</label>
                                    <select className="formSelect"
                                        value={newRoom.Location}
                                        onChange={(e) => handleChange("Location", e.target.value)}>
                                        <option value={""}>Select Location</option>
                                        {Array.from(new Set(mapping.map(m => m.Title)))
                                            .map((loc, index) => (
                                                <option key={index} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="formGroup">
                                    <label>Floor</label>
                                    <select className="formSelect"
                                        value={newRoom.Floor}
                                        onChange={(e) => handleChange("Floor", e.target.value)}>
                                        <option value=""disabled>Select Floor</option>
                                        {Array.from(new Set(mapping.map(m => m.Floor)))
                                            .map((loc, index) => (
                                                <option key={index} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="formGroup">
                                <label>Facilities</label>
                                <input className="formInput"
                                    value={newRoom.Facilities}
                                    onChange={(e) => handleChange("Facilities", e.target.value)} />
                            </div>

                            <div className="formRow">
                                <div className="formGroup">
                                    <label>Capacity</label>
                                    <select
                                        className="formSelect"
                                        value={newRoom.Capacity}
                                        onChange={(e) => handleChange("Capacity", e.target.value)}>
                                        <option value=""disabled>Select Capacity</option>
                                        {Array.from(new Set(mapping.map(m => m.Capacity)))
                                            .map((loc, index) => (
                                                <option key={index} value={loc}>
                                                    {loc}
                                                </option>
                                            ))} 
                                            </select>
                                </div>

                                <div className="formGroup">
                                    <label>Extension Number</label>
                                    <input className="formInput"
                                        value={newRoom.Extension}
                                        placeholder="A-1100"
                                        onChange={(e) => handleChange("Extension", e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="modalFooter">
                            <button className="cancelButton"
                                onClick={() => setShowForm(false)}>
                                Cancel
                            </button>

                            <button className="saveButton"
                                onClick={SaveRoom}>
                                Save
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminPage;