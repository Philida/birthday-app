import { useState, useEffect } from "react";

function App() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    dob: "",
  });

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch("https://birthday-app-da8m.onrender.com/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch("https://birthday-app-da8m.onrender.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    setForm({ username: "", email: "", dob: "" });
    fetchUsers();
  };

  return (
    <div style={containerStyle}>
      
      <h1 style={titleStyle}>🎉 Birthday Reminder</h1>

      {/* FORM */}
      <form onSubmit={submit} style={cardStyle}>
        <h3 style={subtitleStyle}>Add New Birthday</h3>

        <input
          placeholder="Username"
          required
          value={form.username}
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          placeholder="Email"
          type="email"
          required
          value={form.email}
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="date"
          required
          value={form.dob}
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, dob: e.target.value })
          }
        />

        <button style={buttonStyle}>Save 🎉</button>
      </form>

      {/* USER LIST */}
      <div style={cardStyle}>
        <h3 style={subtitleStyle}>📋 Saved Users</h3>

        {users.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            No users yet
          </p>
        ) : (
          users.map((u, index) => (
            <div key={index} style={userItemStyle}>
              <strong>{u.username}</strong>
              <p style={{ margin: "5px 0", color: "#555" }}>{u.email}</p>
              <small style={{ color: "#999" }}>
                DOB: {u.dob}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  fontFamily: "Arial, sans-serif",
  padding: "20px"
};

const titleStyle = {
  color: "white",
  marginBottom: "20px",
  textAlign: "center"
};

const subtitleStyle = {
  marginBottom: "15px",
  color: "#333"
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  marginBottom: "20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s"
};

const userItemStyle = {
  borderBottom: "1px solid #eee",
  padding: "12px 0"
};

export default App;