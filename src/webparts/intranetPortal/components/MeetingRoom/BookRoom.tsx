import * as React from "react";
import "./BookRoom.css";
import { SPFI } from "@pnp/sp";
import { useState, useEffect } from "react";
import { ClockFill, BuildingFill } from "react-bootstrap-icons";

interface IBookRoomProps {
    sp: SPFI;
}

interface IForm {
    Location: string;
    Floor: string;
    Capacity: string;
}

interface IMeetingRooms {
    ID: number;
    Title: string;
    Location: string;
    Floor: string;
    Capacity: string;
    Facilities: string;
    Extension: string;
    Status: string;
}

interface IMapping {
    Title: string[];
    Floor: string[];
    Capacity: string[];
}

interface ITimeSlot {
    time: string;
    Status: "Available" | "Booked" | "Past";
}

const BookRoom: React.FC<IBookRoomProps> = ({ sp }) => {


    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };


    const [currentIndex, setCurrentIndex] = useState(0);
    const VISIBLE_CARDS = 3;

    const [form, setForm] = useState<IForm>({
        Location: "All Locations",
        Floor: "All Floors",
        Capacity: "Any Capacity"
    });

    const [master, setMaster] = useState<IMapping>({
        Title: [],
        Floor: [],
        Capacity: []
    });

    const [rooms, setRooms] = useState<IMeetingRooms[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<IMeetingRooms[]>([]);

    const [BookingOpen, setBookingOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<IMeetingRooms | null>(null);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [roomSlots, setRoomSlots] = useState<Record<number, ITimeSlot[]>>({});
    const [confirmBooking, setConfirmBooking] = useState(false);
    const [purpose, setPurpose] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [confirmSlots, setConfirmSlots] = useState<string[]>([]);


    const timeSlots: ITimeSlot[] =
        selectedRoom && roomSlots[selectedRoom.ID]
            ? roomSlots[selectedRoom.ID]
            : [];

    const generateTimeForRoom = async (roomID: number) => {
        const room = rooms.find(r => r.ID === roomID);
        if (!room) return;

        const now = new Date();
        const slots: ITimeSlot[] = [];

        const bookedItems = await sp.web.lists
            .getByTitle("BookingMeetingRooms")
            .items
            .select("StartTime", "EndTime")
            .filter(
                `RoomName eq '${room.Title}' and BookingDate eq '${selectedDate}'`
            )();

        for (let h = 9; h <= 17; h++) {
            for (let m of [0, 30]) {

                const time = `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;

                const slotTime = new Date(selectedDate);
                slotTime.setHours(h, m, 0, 0);

                let Status: "Available" | "Booked" | "Past" = "Available";


                const booking = bookedItems.find(b => {
                    return time >= b.StartTime && time < b.EndTime;
                });

                if (booking) {
                    Status = "Booked";
                } else if (slotTime <= now) {
                    Status = "Past";
                } else {
                    Status = "Available";
                }

                slots.push({ time, Status });
            }
        }

        setRoomSlots(prev => ({
            ...prev,
            [roomID]: slots
        }));
    };


    useEffect(() => {
        if (selectedRoom) {
            void generateTimeForRoom(selectedRoom.ID);
        }
    }, [selectedDate, selectedRoom]);




    const groupSlotsByHour = () => {
        const map: Record<string, ITimeSlot[]> = {};
        timeSlots.forEach(slot => {
            const hour = slot.time.split(":")[0];
            if (!map[hour]) map[hour] = [];
            map[hour].push(slot);
        });
        return map;
    };


    const formatTime = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        const AMPM = h >= 12 ? "PM" : "AM";
        return `${h % 12 || 12}:${m === 0 ? "00" : "30"} ${AMPM}`;
    };


    const loadData = async () => {
        const items = await sp.web.lists
            .getByTitle("MeetingRooms")
            .items.select("ID", "Title", "Location", "Floor", "Capacity", "Facilities", "Extension")
            .filter("Status eq 'Active'")();

        setRooms(items);
        setFilteredRooms(items);
    };

    const loadMapping = async () => {
        const items = await sp.web.lists
            .getByTitle("MeetingRoomMasterList")
            .items.select("Title", "Floor", "Capacity")
            .filter("Status eq 'Active'")();

        setMaster({
            Title: ["All Locations", ...Array.from(new Set(items.map(i => i.Title)))],
            Floor: ["All Floors", ...Array.from(new Set(items.map(i => i.Floor)))],
            Capacity: ["Any Capacity", ...Array.from(new Set(items.map(i => i.Capacity)))]
        });
    };

    useEffect(() => {
        void loadData();
        void loadMapping();
    }, []);


    useEffect(() => {
        let data = [...rooms];

        if (form.Location !== "All Locations")
            data = data.filter(r => r.Location === form.Location);

        if (form.Floor !== "All Floors")
            data = data.filter(r => r.Floor === form.Floor);

        if (form.Capacity !== "Any Capacity")
            data = data.filter(r => r.Capacity === form.Capacity);

        setFilteredRooms(data);
        setCurrentIndex(0);
    }, [form, rooms]);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentIndex < filteredRooms.length - VISIBLE_CARDS)
            setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0)
            setCurrentIndex(prev => prev - 1);
    };


    const handleBookRoom = (room: IMeetingRooms) => {
        setSelectedRoom(room);
        setSelectedDate(getTodayDate());
        setBookingOpen(true);
        setSelectedSlots([]);

        if (!roomSlots[room.ID]) {
            void generateTimeForRoom(room.ID);
        }
    };



    const handleCloseModal = () => {
        setBookingOpen(false);
        setSelectedRoom(null);
        setSelectedSlots([]);
    };

    const handleSlotClick = (slot: ITimeSlot) => {
        if (slot.Status !== "Available") return;

        setSelectedSlots(prev => {
            if (prev.includes(slot.time)) {
                return prev.filter(t => t !== slot.time);
            } else {
                return [...prev, slot.time].sort();
            }
        });
    };


    const availableCount = timeSlots.filter(s => s.Status === "Available").length;
    const bookedCount = timeSlots.filter(s => s.Status === "Booked").length;

    const handleSaveBooking = () => {
        if (!selectedRoom || selectedSlots.length === 0) return;

        setConfirmSlots([...selectedSlots]);
        setConfirmBooking(true);
    };


    const SelectedDuration = (slots: string[]) => {
        if (!slots || slots.length === 0) return "";

        const first = slots[0];
        const last = slots[slots.length - 1];

        const [sh, sm] = first.split(":").map(Number);
        const [eh, em] = last.split(":").map(Number);

        const start = new Date();
        start.setHours(sh, sm, 0, 0);

        const end = new Date();
        end.setHours(eh, em + 30, 0, 0);

        const diffMs = end.getTime() - start.getTime();
        const diffMin = diffMs / (1000 * 60);

        const hours = Math.floor(diffMin / 60);
        const minutes = diffMin % 60;

        if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
        return `${minutes} minutes`;
    };



    const handleConfirmBooking = async () => {
        if (!selectedRoom || confirmSlots.length === 0) return;

        try {
            const sorted = [...confirmSlots].sort();
            const startSlot = sorted[0];
            const lastSlot = sorted[sorted.length - 1];

            const [h, m] = lastSlot.split(":").map(Number);
            const end = new Date();
            end.setHours(h, m + 30, 0, 0);


            const endSlot24 = `${String(end.getHours()).padStart(2, "0")}:${end.getMinutes() === 0 ? "00" : "30"}`;


            const startTime = formatTime(startSlot);
            const endTime = formatTime(endSlot24);

            const totalDuration = SelectedDuration(sorted);


            await sp.web.lists
                .getByTitle("BookingMeetingRooms")
                .items.add({
                    Title: selectedRoom.Title,
                    Location: selectedRoom.Location,
                    Floor: selectedRoom.Floor,
                    RoomName: selectedRoom.Title,
                    Capacity: selectedRoom.Capacity,
                    ExtensionNo: selectedRoom.Extension,
                    Facilities: selectedRoom.Facilities,
                    BookingDate: selectedDate,
                    StartTime: startTime,
                    EndTime: endTime,
                    Purpose: purpose,
                    Duration: totalDuration,
                    Status: "Booked"
                });


            setRoomSlots(prev => ({
                ...prev,
                [selectedRoom.ID]: prev[selectedRoom.ID].map(s =>
                    sorted.includes(s.time)
                        ? { ...s, Status: "Booked" }
                        : s
                )
            }));

            setConfirmBooking(false);
            setSelectedSlots([]);
            setConfirmSlots([]);
            setPurpose("");
            handleCloseModal();

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);

            await generateTimeForRoom(selectedRoom.ID);

        } catch (error) {
            console.error("Booking save failed:", error);
            alert("Failed to save booking");
        }
    };

    return (
        <div className="bookRoomWrapper">
            <div className="bookRoomHeader">
                <div>
                    <h1>Book a Room</h1>
                    <p>Select a room to view availability and book your slot</p>
                </div>

                <div className="infoBadge">
                    ℹ️ Click any room to see available slots
                </div>
            </div>

            <div className="filterCard">
                <div className="row">
                    <div className="field">
                        <label>Location</label>
                        <select name="Location" value={form.Location} onChange={onChange}>
                            {master.Title.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Floor</label>
                        <select name="Floor" value={form.Floor} onChange={onChange}>
                            {master.Floor.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Capacity</label>
                        <select name="Capacity" value={form.Capacity} onChange={onChange}>
                            {master.Capacity.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="roomSlider">
                {currentIndex > 0 && (
                    <button className="arrowLeft" onClick={handlePrev}>‹</button>
                )}

                {currentIndex < filteredRooms.length - VISIBLE_CARDS && (
                    <button className="arrowRight" onClick={handleNext}>›</button>
                )}

                <div className="roomsliderViewport">
                    <div className="roomGrid">
                        {filteredRooms
                            .slice(currentIndex, currentIndex + VISIBLE_CARDS)
                            .map(room => (
                                <div className="roomCard" key={room.ID}>

                                    <div className="roomImage">
                                        <span className="capacityBadge">{room.Capacity}</span>
                                        <div className="roomLocation">
                                            <div className="buildingName">{room.Location}</div>
                                            <div className="floorName">{room.Floor}</div>
                                        </div>
                                    </div>


                                    <div className="roomBody">
                                        <h3>{room.Title}</h3>

                                        <div className="phone">📞 {room.Extension}</div>

                                        <div className="amenities">
                                            {room.Facilities
                                                ?.split(",")
                                                .map((facility, index) => (
                                                    <span key={index}>
                                                        {facility.trim()}
                                                    </span>
                                                ))}
                                        </div>

                                        <button
                                            className="bookButton"
                                            onClick={() => handleBookRoom(room)}
                                        >
                                            <span>Click to book</span>
                                            <div className="arrowIcon">→</div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Bookin Popup */}
                {BookingOpen && selectedRoom && (
                    <div className="TimeOverlay" onClick={handleCloseModal}>
                        <div className="TimeContent" onClick={(e) => e.stopPropagation()}>

                            <div className="TimeHeader">

                                <button className="CancelButton" onClick={handleCloseModal}>×</button>

                                <div className="headerRow">

                                    <div className="headerIcon">
                                        <BuildingFill size={32} />
                                    </div>

                                    <div className="headerText">
                                        <h2>{selectedRoom.Title}</h2>

                                        <p>
                                            Capacity: {selectedRoom.Capacity} • {selectedRoom.Floor} • {selectedRoom.Location}
                                        </p>

                                        <div className="slotSummary">
                                            <span className="slotItem">
                                                <span className="dot availableDot"></span>
                                                {availableCount} slots available
                                            </span>

                                            <span className="slotItem">
                                                <span className="dot bookedDot"></span>
                                                {bookedCount} slots booked
                                            </span>
                                        </div>

                                    </div>

                                </div>
                            </div>

                            <div className="TimeBody">
                                <label>Select Date</label>

                                <div className="dateInputWrapper">
                                    <input
                                        type="date"
                                        className="dateInput"
                                        value={selectedDate}
                                        min={getTodayDate()}
                                        onChange={e => setSelectedDate(e.target.value)}
                                    />
                                    <div className="slotDuration"><ClockFill size={20} />
                                        30-min Slots</div>
                                </div>


                                <div className="legendContainer">
                                    <div className="statusLegend">

                                        <div className="legendItem">
                                            <div className="legendDot available"></div>
                                            <span>Available</span>
                                        </div>

                                        <div className="legendItem">
                                            <div className="legendDot booked"></div>
                                            <span>Booked</span>
                                        </div>

                                        <div className="legendItem">
                                            <div className="legendDot selected"></div>
                                            <span>Selected</span>
                                        </div>

                                        <div className="legendItem">
                                            <div className="legendDot past"></div>
                                            <span>Past</span>
                                        </div>

                                    </div>
                                </div>

                                <div className="sectionTitle">Available Time Slots</div>

                                {/* Time Slots */}
                                {Object.entries(groupSlotsByHour())
                                    .sort(([a], [b]) => Number(a) - Number(b))
                                    .map(([hour, slots]) => (
                                        <div className="TimeSlotGrid" key={hour}>

                                            <div className="hourLabel">
                                                {formatTime(`${hour}:00`)}
                                            </div>

                                            {(slots as ITimeSlot[])
                                                .filter(s => s.time.endsWith(":00"))
                                                .map(slot => (
                                                    <button
                                                        key={slot.time}
                                                        className={`slotButton ${slot.Status} ${selectedSlots.includes(slot.time) ? "selected" : ""
                                                            }`}
                                                        disabled={slot.Status !== "Available"}
                                                        onClick={() => handleSlotClick(slot)}
                                                    >
                                                        {formatTime(slot.time)}
                                                    </button>
                                                ))}

                                            {(slots as ITimeSlot[])
                                                .filter(s => s.time.endsWith(":30"))
                                                .map(slot => (
                                                    <button
                                                        key={slot.time}
                                                        className={`slotButton ${slot.Status} ${selectedSlots.includes(slot.time) ? "selected" : ""
                                                            }`}
                                                        disabled={slot.Status !== "Available"}
                                                        onClick={() => handleSlotClick(slot)}
                                                    >
                                                        {formatTime(slot.time)}
                                                    </button>
                                                ))}
                                        </div>
                                    ))}


                                <div className="bookingActions">

                                    <button
                                        className="cancelBtn"
                                        onClick={handleCloseModal}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="saveBtn"
                                        disabled={!selectedSlots}
                                        onClick={() => handleSaveBooking()}
                                    >
                                        Confirm Booking
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}
                {/* Booking Confirmation Pop Up */}
                {confirmBooking && selectedRoom && selectedSlots && (
                    <div className="confirmOverlay">
                        <div className="confirmCard">
                            <div className="confirmIcon">
                                <ClockFill size={28} />
                            </div>

                            <h2>Confirm Booking</h2>
                            <p>Please review your booking details.</p>

                            <div className="confirmRow">
                                <span>Room</span>
                                <strong>{selectedRoom.Title}</strong>
                            </div>


                            <div className="confirmRow">
                                <span>
                                    Booking Date
                                </span>
                                <strong> {new Date(selectedDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                                </strong>
                            </div>

                            <div className="confirmRow">
                                <span>Time</span>
                                <strong className="timeHighlight">
                                    {formatTime(selectedSlots[0])} – {formatTime(
                                        (() => {
                                            const last = selectedSlots[selectedSlots.length - 1];
                                            const [h, m] = last.split(":").map(Number);
                                            const d = new Date();
                                            d.setHours(h, m + 30, 0, 0);
                                            return `${String(d.getHours()).padStart(2, "0")}:${m === 0 ? "30" : "00"}`;
                                        })()
                                    )}
                                </strong>
                            </div>


                            <div className="confirmRow">
                                <span>Duration</span>
                                <strong>{SelectedDuration(confirmSlots)}</strong>

                            </div>

                            <div className="confirmRow">
                                <span>Purpose</span>
                                <input
                                    type="text"
                                    className="purposeInput"
                                    placeholder="Enter meeting purpose"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>



                            <div className="confirmAction">
                                <button className="cancelConfirm"
                                    onClick={() => setConfirmBooking(false)}>
                                    Cancel
                                </button>

                                <button className="confirmButton"
                                    onClick={handleConfirmBooking}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showSuccess && (
                <div className="success-card">
                    <div className="success-circle">✓</div>
                    <span className="success-text">
                        Booking confirmed successfully! 🎉
                    </span>
                </div>
            )}


        </div>
    );
};

export default BookRoom;