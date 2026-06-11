import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) return setError("Please fill in all fields.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during signup.");
      }

      // Save credentials in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);
      navigate("/userDashboard");
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <style dangerouslySetInnerHTML={{__html: `
        .signup-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', system-ui, sans-serif;
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
          .form-panel { flex: 1; min-height: 100vh; order: 1; }
        }
      `}} />

      {/* LEFT COLUMN: Form Card */}
      <div className="form-panel">
        <div className="form-card">
          <div style={{ marginBottom: "20px" }}>
            <Link to="/events" style={{ color: "#57534e", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
              ← Back to Home
            </Link>
          </div>

          <div style={{ marginBottom: "24px" }}>
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
            <p style={{ fontSize: "14px", color: "#57534e", margin: 0 }}>Create a new account</p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                className="input-field"
                style={{
                  border: nameFocused ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                  boxShadow: nameFocused ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Password</label>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  className="input-field"
                  style={{
                    paddingRight: "44px",
                    border: confirmPasswordFocused ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                    boxShadow: confirmPasswordFocused ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#78716c", padding: "4px" }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", borderTop: "1.5px solid #e5e4e7", paddingTop: "16px", fontSize: "13px", color: "#57534e" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Homepage styled Info panel */}
      <div className="info-panel">
        {/* Glows from homepage */}
        <div style={{
          position: "absolute",
          bottom: "-80px", right: "-60px",
          width: 420, height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          top: "-60px", right: "20%",
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
            Join the Community
          </span>
          <h1 style={{
            fontSize: "clamp(34px, 4vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            color: "#1c1917",
            margin: 0
          }}>
            Join the Community of <br />
            <span style={{
              background: "linear-gradient(90deg, #9333ea, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Event Creators</span><br />
            Globally.
          </h1>
        </div>
      </div>
    </div>
  );
}
