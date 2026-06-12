import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) return setError("Please fill in all fields.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email address.");

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      // Save credentials in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role || "user");

      setLoading(false);
      if (data.role === "organizer") {
        navigate("/organizerpanel");
      } else {
        navigate("/userDashboard");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .info-panel {
          flex: 1.2;
          background: #fdf8f2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px;
          position: relative;
          overflow: hidden;
        }
        .form-panel {
          flex: 1;
          background: #FF8A3D;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
        }
        .form-card {
          width: 100%;
          max-width: 400px;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 40px 32px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          color: #1c1917;
          background: #FFFFFF;
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        @media (max-width: 900px) {
          .info-panel { display: none; }
          .form-panel { flex: 1; min-height: 100vh; }
        }
      `}} />

      {/* LEFT COLUMN: Homepage styled Info panel */}
      <div className="info-panel">
        {/* Glows from homepage */}
        <div style={{
          position: "absolute",
          bottom: "-80px", left: "-60px",
          width: 420, height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          top: "-60px", left: "20%",
          width: 320, height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
        }} />

        <div style={{ zIndex: 5, maxWidth: "520px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#c2410c",
            textTransform: "uppercase",
            display: "block",
            marginBottom: "16px"
          }}>
            Event Management Platform
          </span>
          <h1 style={{
            fontSize: "clamp(34px, 4vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            color: "#1c1917",
            margin: 0
          }}>
            Plan, Discover &<br />
            <span style={{
              background: "linear-gradient(90deg, #9333ea, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Manage Events</span><br />
            Effortlessly.
          </h1>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Card */}
      <div className="form-panel">
        <div className="form-card">
          <div style={{ marginBottom: "20px" }}>
            <Link to="/events" style={{ color: "#57534e", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
              ← Back to Home
            </Link>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h2 style={{
              fontSize: "26px",
              fontWeight: 800,
              margin: "0 0 6px 0",
              background: "linear-gradient(90deg, #ea580c, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block"
            }}>
              NexEvent
            </h2>
            <p style={{ fontSize: "14px", color: "#57534e", margin: 0 }}>Log in to your account</p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="input-field"
                style={{
                  border: emailFocused ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                  boxShadow: emailFocused ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Password</label>
                <a href="#" style={{ fontSize: "12px", color: "#ea580c", textDecoration: "none" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="input-field"
                  style={{
                    paddingRight: "44px",
                    border: passwordFocused ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                    boxShadow: passwordFocused ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#78716c", padding: "4px" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#BFA6E8",
                color: "#111111",
                fontSize: "14px",
                fontWeight: 700,
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                marginTop: "8px",
                transition: "all 0.2s",
                boxShadow: btnHover ? "0 4px 12px rgba(191, 166, 232, 0.4)" : "none",
                transform: btnHover ? "translateY(-1px)" : "none",
                opacity: loading ? 0.8 : 1
              }}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", borderTop: "1.5px solid #e5e4e7", paddingTop: "16px", fontSize: "13px", color: "#57534e" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
