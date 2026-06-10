import { useEffect, useState } from "react";
import HeroImage from "../assets/HeroImage.png";


export default function App() {
  const [visible, setVisible] = useState(false);

  const NAV_LINKS = ["Home", "Events", "Contact"];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style = {{ width: "100%", fontFamily: "'Inter', system-ui, sans-serif" }}>

  {/* ── HERO ── */ }
  < div style = {{
  position: "relative",
    width: "100%",
      minHeight: "100vh",
        display: "flex",
          flexDirection: "column",
            overflow: "hidden",
              background: "#fdf8f2",
      }}>

  {/* Blurred image — right side, less blur */ }
  < div style = {{
  position: "absolute",
    inset: 0,
      backgroundImage: `url(${HeroImage})`,
        backgroundSize: "60%",
          backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
              filter: "blur(2px) saturate(0.9)",
                transform: "scale(1.03)",
                  zIndex: 0,
        }} />

{/* Warm gradient fade left → transparent right */ }
<div style={{
  position: "absolute",
  inset: 0,
  background: `linear-gradient(
            to right,
            #fdf8f2 0%,
            #fdf8f2 38%,
            rgba(253,248,242,0.88) 52%,
            rgba(253,248,242,0.35) 68%,
            rgba(253,248,242,0.05) 100%
          )`,
  zIndex: 1,
}} />

{/* Warm orange glow — bottom left */ }
<div style={{
  position: "absolute",
  bottom: "-80px", left: "-60px",
  width: 420, height: 420,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)",
  zIndex: 2,
}} />

{/* Purple glow — top left */ }
<div style={{
  position: "absolute",
  top: "-60px", left: "20%",
  width: 320, height: 320,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
  zIndex: 2,
}} />

{/* ── NAV ── */ }
<nav style={{
  position: "relative", zIndex: 10,
  width: "100%",
  padding: "28px 64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxSizing: "border-box",
}}>
  <span style={{
    fontSize: 19, fontWeight: 800,
    background: "linear-gradient(90deg, #ea580c, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  }}>NexEvent</span>

  <ul style={{
    display: "flex", gap: 40,
    listStyle: "none", margin: 0, padding: 0,
  }}>
    {NAV_LINKS.map((l) => (
      <li key={l}>
        <a href="#" style={{
          fontSize: 14, fontWeight: 500,
          color: "#44403c", textDecoration: "none",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#ea580c"}
          onMouseLeave={e => e.currentTarget.style.color = "#44403c"}
        >{l}</a>
      </li>
    ))}
  </ul>
</nav>

{/* ── CONTENT ── */ }
<div style={{
  position: "relative", zIndex: 10,
  flex: 1,
  display: "flex",
  alignItems: "center",
  padding: "0 64px 80px",
  maxWidth: 580,
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : "translateY(24px)",
  transition: "opacity 0.8s ease, transform 0.8s ease",
}}>
  <div>

    {/* Eyebrow */}
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 22,
      padding: "5px 12px 5px 8px",
      background: "rgba(251,146,60,0.1)",
      border: "1px solid rgba(251,146,60,0.25)",
      borderRadius: 20,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#f97316",
      }} />
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
        color: "#c2410c", textTransform: "uppercase",
      }}>
        Event Management Platform
      </span>
    </div>

    {/* Headline */}
    <h1 style={{
      fontSize: "clamp(38px, 5vw, 66px)",
      fontWeight: 900,
      color: "#1c1917",
      lineHeight: 1.08,
      letterSpacing: "-1.5px",
      margin: "0 0 22px",
    }}>
      Plan, Discover &<br />
      <span style={{
        background: "linear-gradient(90deg, #9333ea, #ea580c)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>Manage Events</span><br />
      Effortlessly
    </h1>

    {/* Body */}
    <p style={{
      fontSize: 16,
      color: "#57534e",
      lineHeight: 1.8,
      maxWidth: 400,
      marginBottom: 38,
    }}>
      NexEvent helps organizers create memorable events while making it
      easy for attendees to discover, register, and participate.
    </p>

    {/* Buttons */}
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <button
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(234,88,12,0.4)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(234,88,12,0.25)";
        }}
        style={{
          padding: "13px 28px",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff",
          fontSize: 14, fontWeight: 600,
          border: "none", borderRadius: 10,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(234,88,12,0.25)",
          transition: "transform 0.2s, box-shadow 0.2s",
          letterSpacing: "0.1px",
        }}>
        Browse Events
      </button>

      <button
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(147,51,234,0.07)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          padding: "12px 28px",
          backgroundColor: "transparent",
          color: "#9333ea",
          fontSize: 14, fontWeight: 600,
          border: "1.5px solid rgba(147,51,234,0.35)",
          borderRadius: 10,
          cursor: "pointer",
          transition: "background 0.2s, transform 0.2s",
          letterSpacing: "0.1px",
        }}>
        Organize Event
      </button>
    </div>

    {/* Social proof */}
    <p style={{
      marginTop: 28, fontSize: 13,
      color: "#a8a29e", letterSpacing: "0.1px",
    }}>
      Trusted by{" "}
      <span style={{ color: "#ea580c", fontWeight: 600 }}>2,000+</span>
      {" "}organizers worldwide
    </p>

  </div>
</div>
      </div >
    </div >
  );
}