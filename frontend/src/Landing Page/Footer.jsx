import React from "react";

const Footer = () => {
    const NAV_LINKS = ["Home", "Events", "Contact"];
    return (
        <footer style={{ backgroundColor: "#1c1917", color: "#78716c" }}>
            <div style={{
                padding: "36px 64px",
                display: "flex", flexWrap: "wrap",
                alignItems: "center", justifyContent: "space-between", gap: 20,
                boxSizing: "border-box",
            }}>
                <div>
                    <p style={{
                        fontWeight: 700, fontSize: 15, marginBottom: 3,
                        background: "linear-gradient(90deg, #fb923c, #a855f7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>NexEvent</p>
                    <p style={{ fontSize: 13 }}>Making event management simple.</p>
                </div>
                <ul style={{ display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0 }}>
                    {NAV_LINKS.map((l) => (
                        <li key={l}>
                            <a href="#" style={{
                                fontSize: 13, color: "#78716c", textDecoration: "none",
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = "#fb923c"}
                                onMouseLeave={e => e.currentTarget.style.color = "#78716c"}
                            >{l}</a>
                        </li>
                    ))}
                </ul>
                <p style={{ fontSize: 12, color: "#44403c" }}>© 2026 NexEvent. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;