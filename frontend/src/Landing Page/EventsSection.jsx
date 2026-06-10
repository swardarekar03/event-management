import React, { useState } from "react";
import "./EventsSection.css";
import musicev from "../assets/musical-ev.png";
import workshopev from "../assets/workshop.png";
import sportsev from "../assets/sport-ev.png";
import culturalev from "../assets/cultural-ev.png";
import techev from "../assets/tech-ev.png";
import busyev from "../assets/business.png";
import clgev from "../assets/clg-fest.png";

const categories = [
    { id: 1, name: "Music", icon: musicev, type: "music" },
    { id: 2, name: "Workshops", icon: workshopev, type: "workshop" },
    { id: 3, name: "Sports", icon: sportsev, type: "sports" },
    { id: 4, name: "Cultural", icon: culturalev, type: "cultural" },
    { id: 5, name: "Tech", icon: techev, type: "tech" },
    { id: 7, name: "Business", icon: busyev, type: "business" },
    { id: 8, name: "College", icon: clgev, type: "college" },
];

const allEvents = [
    {
        id: 1,
        title: "Summer Music Fest",
        location: "Mumbai",
        date: "20 June 2026",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
        category: "music",
        price: "₹999",
        attendees: "1.2k+",
    },
    {
        id: 2,
        title: "AI & Innovation Summit",
        location: "Pune",
        date: "25 June 2026",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        category: "tech",
        price: "₹1499",
        attendees: "500+",
    },
    {
        id: 3,
        title: "Cultural Night 2026",
        location: "Nashik",
        date: "30 June 2026",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865",
        category: "cultural",
        price: "₹599",
        attendees: "800+",
    },
    {
        id: 4,
        title: "Startup Networking",
        location: "Bangalore",
        date: "5 July 2026",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
        category: "business",
        price: "Free",
        attendees: "300+",
    },
    {
        id: 5,
        title: "Football Championship",
        location: "Delhi",
        date: "10 July 2026",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20",
        category: "sports",
        price: "₹399",
        attendees: "2k+",
    },
    {
        id: 6,
        title: "React Native Workshop",
        location: "Hyderabad",
        date: "15 July 2026",
        image: "https://images.unsplash.com/photo-1515187029135-8ee946dac632",
        category: "workshop",
        price: "₹799",
        attendees: "150+",
    },
    {
        id: 7,
        title: "College Annual Fest",
        location: "Mumbai",
        date: "20 July 2026",
        image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce",
        category: "college",
        price: "₹299",
        attendees: "3k+",
    },
    {
        id: 8,
        title: "Jazz & Blues Concert",
        location: "Kolkata",
        date: "25 July 2026",
        image: "https://images.unsplash.com/photo-1501612780327-45045538702b",
        category: "music",
        price: "₹1299",
        attendees: "900+",
    },
    {
        id: 9,
        title: "Digital Marketing Workshop",
        location: "Pune",
        date: "30 July 2026",
        image: "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293",
        category: "workshop",
        price: "₹699",
        attendees: "200+",
    },
];

export default function EventsSection() {
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Filter events based on selected category
    const filteredEvents = selectedCategory === "all" 
        ? allEvents 
        : allEvents.filter(event => event.category === selectedCategory);

    const handleCategoryClick = (categoryType) => {
        setSelectedCategory(categoryType);
    };

    return (
        <div className="events-container">
            {/* Categories as Inline Filters */}
            <div className="filters-wrapper">
                <div className="filters-header">
                    <h2>Discover Events</h2>
                    <p>Find the perfect event that matches your interest</p>
                </div>
                
                <div className="categories-filter">
                    <button 
                        className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("all")}
                    >
                        {/* <span className="chip-icon">🎯</span> */}
                        All Events
                    </button>
                    
                    {categories.map((category) => (
                        <button 
                            key={category.id} 
                            className={`filter-chip ${selectedCategory === category.type ? "active" : ""}`}
                            onClick={() => handleCategoryClick(category.type)}
                        >
                            <img src={category.icon} alt={category.name} className="chip-icon-img" />
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Stats */}
            <div className="results-stats">
                <span className="events-count">{filteredEvents.length} Events Found</span>
                {selectedCategory !== "all" && (
                    <button 
                        className="clear-filter"
                        onClick={() => handleCategoryClick("all")}
                    >
                        Clear Filter ✕
                    </button>
                )}
            </div>

            {/* Events Grid with Fixed Size Cards */}
            <div className="events-grid">
                {filteredEvents.map((event) => (
                    <div key={event.id} className="event-card">
                        <div className="card-image-wrapper">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="event-image"
                            />
                            <div className="card-badge">{event.category}</div>
                        </div>
                        
                        <div className="event-content">
                            <div className="event-header">
                                <h3>{event.title}</h3>
                                <span className="event-price">{event.price}</span>
                            </div>
                            
                            <div className="event-details">
                                <div className="detail-item">
                                    <span className="detail-icon">Date:</span>
                                    <span>{event.date}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">Loaction:</span>
                                    <span>{event.location}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">Attendies</span>
                                    <span>{event.attendees} attending</span>
                                </div>
                            </div>
                            
                            <button className="register-btn">
                                Register Now →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Events State */}
            {filteredEvents.length === 0 && (
                <div className="no-events">
                    <div className="no-events-icon">🔍</div>
                    <h3>No events found</h3>
                    <p>We couldn't find any events in this category</p>
                    <button 
                        className="view-all-btn"
                        onClick={() => handleCategoryClick("all")}
                    >
                        View All Events
                    </button>
                </div>
            )}
        </div>
    );
}