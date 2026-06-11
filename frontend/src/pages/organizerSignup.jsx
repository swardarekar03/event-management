import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function OrganizerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form states
  // Account Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orgName, setOrgName] = useState("");

  // Address Information
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  // Verification Information
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // Visual/UI helper states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation before going to next step
  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!fullName || !email || !phone || !password || !confirmPassword || !orgName) {
        return setError("Please fill in all account information fields.");
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return setError("Invalid email address.");
      }
      if (phone.replace(/\D/g, "").length < 10) {
        return setError("Please enter a valid phone number (at least 10 digits).");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }
      if (password !== confirmPassword) {
        return setError("Passwords do not match.");
      }
      setStep(2);
    } else if (step === 2) {
      if (!country || !state || !city || !address || !pincode) {
        return setError("Please fill in all address information fields.");
      }
      if (pincode.trim().length < 4) {
        return setError("Please enter a valid pincode.");
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!idType || !idNumber) {
      return setError("Please fill in all verification information fields.");
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/organizers/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          orgName,
          email,
          phone,
          password,
          address,
          city,
          state,
          country,
          pincode,
          idType,
          idNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during signup.");
      }

      // Save credentials in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.organizer));

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="org-signup-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .org-signup-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .form-panel {
          flex: 1.2;
          background: #FF8A3D;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
        }
        .info-panel {
          flex: 1;
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
          max-width: 500px;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 40px 32px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          z-index: 10;
          transition: all 0.3s ease;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          color: #1c1917;
          background: #FFFFFF;
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .select-field {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          color: #1c1917;
          background: #FFFFFF;
          border-radius: 10px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          position: relative;
        }
        .step-indicator::before {
          content: "";
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 3px;
          background: #e5e4e7;
          z-index: 1;
        }
        .step-progress-bar {
          position: absolute;
          top: 15px;
          left: 0;
          height: 3px;
          background: #9333ea;
          z-index: 1;
          transition: width 0.3s ease;
        }
        .step-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3px solid #e5e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #78716c;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }
        .step-node.active {
          border-color: #9333ea;
          color: #9333ea;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.15);
        }
        .step-node.completed {
          border-color: #9333ea;
          background: #9333ea;
          color: #FFFFFF;
        }
        .step-label {
          position: absolute;
          top: 38px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          color: #78716c;
        }
        .step-label.active {
          color: #1c1917;
          font-weight: 700;
        }
        @media (max-width: 900px) {
          .org-signup-container {
            flex-direction: column;
          }
          .info-panel { display: none; }
          .form-panel { flex: 1; min-height: 100vh; }
        }
        @media (max-width: 500px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      {/* LEFT COLUMN: Info & Stepper Status */}
      <div className="info-panel">
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
            For Event Organizers
          </span>
          <h1 style={{
            fontSize: "clamp(34px, 4vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            color: "#1c1917",
            margin: "0 0 24px 0"
          }}>
            Grow Your<br />
            <span style={{
              background: "linear-gradient(90deg, #9333ea, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Event Business</span><br />
            With NexEvent.
          </h1>
          <p style={{ fontSize: "15px", color: "#57534e", lineHeight: "1.6", margin: "0 0 32px 0", maxWidth: "420px" }}>
            Create custom landing pages, sell tickets instantly, track analytics, and build an audience of verified event lovers.
          </p>

          {/* Detailed Stepper Helper in Info Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: step >= 1 ? "rgba(147, 51, 234, 0.1)" : "transparent",
                border: step >= 1 ? "2px solid #9333ea" : "2px solid #a8a29e",
                display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center",
                fontWeight: 700, color: step >= 1 ? "#9333ea" : "#a8a29e", fontSize: "14px"
              }}>
                1
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: step === 1 ? "#1c1917" : "#78716c" }}>Account Setup</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>Define name, password and company details.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: step >= 2 ? "rgba(147, 51, 234, 0.1)" : "transparent",
                border: step >= 2 ? "2px solid #9333ea" : "2px solid #a8a29e",
                display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center",
                fontWeight: 700, color: step >= 2 ? "#9333ea" : "#a8a29e", fontSize: "14px"
              }}>
                2
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: step === 2 ? "#1c1917" : "#78716c" }}>Address Details</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>Provide location and business coordinates.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: step >= 3 ? "rgba(147, 51, 234, 0.1)" : "transparent",
                border: step >= 3 ? "2px solid #9333ea" : "2px solid #a8a29e",
                display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center",
                fontWeight: 700, color: step >= 3 ? "#9333ea" : "#a8a29e", fontSize: "14px"
              }}>
                3
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: step === 3 ? "#1c1917" : "#78716c" }}>Verification Info</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#78716c" }}>Upload legal identifiers for trust validation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Form Wizard */}
      <div className="form-panel">
        <div className="form-card">
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/" style={{ color: "#57534e", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
              ← Back to Home
            </Link>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#78716c", background: "#f5f5f7", padding: "4px 8px", borderRadius: "6px" }}>
              Organizer Only
            </span>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 800,
              margin: "0 0 6px 0",
              background: "linear-gradient(90deg, #ea580c, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block"
            }}>
              NexEvent Portal
            </h2>
            <p style={{ fontSize: "14px", color: "#57534e", margin: 0 }}>Register as a Host Creator</p>
          </div>

          {/* Stepper Progress bar */}
          <div className="step-indicator">
            <div className="step-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            <div className={`step-node ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
              {step > 1 ? "✓" : "1"}
              <span className={`step-label ${step === 1 ? "active" : ""}`} style={{ left: "-18px" }}>Account</span>
            </div>
            <div className={`step-node ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
              {step > 2 ? "✓" : "2"}
              <span className={`step-label ${step === 2 ? "active" : ""}`} style={{ left: "-18px" }}>Address</span>
            </div>
            <div className={`step-node ${step === 3 ? "active" : ""}`}>
              3
              <span className={`step-label ${step === 3 ? "active" : ""}`} style={{ right: "-20px" }}>Verification</span>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "12px", color: "#16a34a", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
              <h4 style={{ margin: "0 0 4px 0", fontWeight: 700 }}>Registration Successful!</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#16a34a" }}>Your organizer account has been created. Redirecting to Login...</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* STEP 1: Account Information */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917", margin: "0 0 4px 0", borderBottom: "1.5px solid #f2f0f5", paddingBottom: "6px" }}>
                    Account Information
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onFocus={() => setFocusedField("fullName")}
                      onBlur={() => setFocusedField("")}
                      className="input-field"
                      style={{
                        border: focusedField === "fullName" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                        boxShadow: focusedField === "fullName" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Organization Name</label>
                    <input
                      type="text"
                      placeholder="Apex Events Group"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      onFocus={() => setFocusedField("orgName")}
                      onBlur={() => setFocusedField("")}
                      className="input-field"
                      style={{
                        border: focusedField === "orgName" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                        boxShadow: focusedField === "orgName" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                      }}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="host@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "email" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "email" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "phone" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "phone" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField("")}
                          className="input-field"
                          style={{
                            paddingRight: "44px",
                            border: focusedField === "password" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                            boxShadow: focusedField === "password" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
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
                          onFocus={() => setFocusedField("confirmPassword")}
                          onBlur={() => setFocusedField("")}
                          className="input-field"
                          style={{
                            paddingRight: "44px",
                            border: focusedField === "confirmPassword" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                            boxShadow: focusedField === "confirmPassword" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
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
                  </div>
                </div>
              )}

              {/* STEP 2: Address Information */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917", margin: "0 0 4px 0", borderBottom: "1.5px solid #f2f0f5", paddingBottom: "6px" }}>
                    Address Information
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Address Line</label>
                    <input
                      type="text"
                      placeholder="123 Business District, Suite 501"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      onFocus={() => setFocusedField("address")}
                      onBlur={() => setFocusedField("")}
                      className="input-field"
                      style={{
                        border: focusedField === "address" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                        boxShadow: focusedField === "address" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                      }}
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        onFocus={() => setFocusedField("city")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "city" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "city" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        onFocus={() => setFocusedField("state")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "state" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "state" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        onFocus={() => setFocusedField("country")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "country" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "country" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>Pincode</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        onFocus={() => setFocusedField("pincode")}
                        onBlur={() => setFocusedField("")}
                        className="input-field"
                        style={{
                          border: focusedField === "pincode" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                          boxShadow: focusedField === "pincode" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Verification Information */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917", margin: "0 0 4px 0", borderBottom: "1.5px solid #f2f0f5", paddingBottom: "6px" }}>
                    Verification Information
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>ID Type</label>
                    <select
                      value={idType}
                      onChange={e => setIdType(e.target.value)}
                      onFocus={() => setFocusedField("idType")}
                      onBlur={() => setFocusedField("")}
                      className="select-field"
                      style={{
                        border: focusedField === "idType" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                        boxShadow: focusedField === "idType" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                      }}
                      required
                    >
                      <option value="" disabled>Select ID Document Type</option>
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="GSTIN">GSTIN Certificate</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>ID Number</label>
                    <input
                      type="text"
                      placeholder="Enter corresponding document ID number"
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                      onFocus={() => setFocusedField("idNumber")}
                      onBlur={() => setFocusedField("")}
                      className="input-field"
                      style={{
                        border: focusedField === "idNumber" ? "1.5px solid #9333ea" : "1.5px solid #e5e4e7",
                        boxShadow: focusedField === "idNumber" ? "0 0 0 3px rgba(147, 51, 234, 0.1)" : "none"
                      }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    onMouseEnter={() => setBackBtnHover(true)}
                    onMouseLeave={() => setBackBtnHover(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: backBtnHover ? "rgba(147, 51, 234, 0.05)" : "transparent",
                      color: "#9333ea",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "1.5px solid rgba(147, 51, 234, 0.3)",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      flex: 2,
                      padding: "12px",
                      background: "#BFA6E8",
                      color: "#111111",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: btnHover ? "0 4px 12px rgba(191, 166, 232, 0.4)" : "none",
                      transform: btnHover ? "translateY(-1px)" : "none"
                    }}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={() => navigate("/organizerpanel")}
                    disabled={loading}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      flex: 2,
                      padding: "12px",
                      background: "#BFA6E8",
                      color: "#111111",
                      fontSize: "14px",
                      fontWeight: 700,
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: btnHover ? "0 4px 12px rgba(191, 166, 232, 0.4)" : "none",
                      transform: btnHover ? "translateY(-1px)" : "none",
                      opacity: loading ? 0.8 : 1
                    }}
                  >
                    {loading ? "Registering..." : "Submit Registration"}
                  </button>
                )}
              </div>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "24px", borderTop: "1.5px solid #e5e4e7", paddingTop: "16px", fontSize: "13px", color: "#57534e" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#ea580c", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
