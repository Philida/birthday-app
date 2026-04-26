import { useState, useEffect } from "react";

function App() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    dob: "",
  });

  const [users, setUsers] = useState([]);

  // Fetch users
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    fetchUsers(); // refresh list
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      fontFamily: "Arial",
      padding: "20px"
    }}>
      
      {/* FORM */}
      <form
        onSubmit={submit}
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          width: "320px",
          marginBottom: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >
        <h2 style={{ textAlign: "center" }}>🎂 Add Birthday</h2>

        <input
          placeholder="Username"
          required
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          placeholder="Email"
          type="email"
          required
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="date"
          required
          style={inputStyle}
          onChange={(e) =>
            setForm({ ...form, dob: e.target.value })
          }
        />

        <button style={buttonStyle}>Save 🎉</button>
      </form>

      {/* USER LIST */}
      <div style={{
        background: "white",
        padding: "20px",
        borderRadius: "15px",
        width: "320px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <h3>📋 Saved Users</h3>

        {users.length === 0 ? (
          <p>No users yet</p>
        ) : (
          users.map((u, index) => (
            <div key={index} style={{
              borderBottom: "1px solid #eee",
              padding: "10px 0"
            }}>
              <strong>{u.username}</strong><br />
              <small>{u.email}</small><br />
              <small>DOB: {u.dob}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#667eea",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};

export default App;