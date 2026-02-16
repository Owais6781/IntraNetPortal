import * as React from "react";
import { SPFI } from "@pnp/sp";
import "./MyBookings.css";
import { useState } from "react";

interface IProps{
    sp:SPFI
}

const MyBookings:React.FC<IProps>=({sp})=> {

    const[activeTab, setActiveTab] = useState<string>('Upcoming')
    return(
        <div className="Container">
        <div className="header">
            <h1 className="title">My Bookings</h1>
            <p className="subtitle">Manage your meeting rooms reservation.</p>
        </div>

        <div className="tabContainer">
            <button className={`tab ${activeTab==='Upcoming' ? 'active': ''}`}
            onClick={() => setActiveTab('Upcoming')}>
                Upcoming
            </button>

            <button className={`tab ${activeTab === 'Past' ? 'active': ''}`}
            onClick={() => setActiveTab('Past')}>
                Past
            </button>

            <button className={`tab ${activeTab === 'Cancelled'? 'active': ''}`}
            onClick={()=> setActiveTab('Cancelled')}>
                Cancelled
            </button>
        </div>
        </div>
    )
};

export  default MyBookings;