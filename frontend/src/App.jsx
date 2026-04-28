import { useState, useEffect } from "react";

function App() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    dob: "",
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const API = "https://birthday-app-da8m.onrender.com/users";

  const fetchUsers = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setEditingId(null);
    } else {
      // CREATE
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ username: "", email: "", dob: "" });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  };

  const editUser = (user) => {
    setForm({
      username: user.username,
      email: user.email,
      dob: user.dob,
    });
    setEditingId(user._id);
  };

  const getCountdown = (dob) => {
    const today = new Date();
    const birth = new Date(dob);

    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < today) next.setFullYear(today.getFullYear() + 1);

    const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "🎉 Today!" : `${diff} days`;
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎉 Birthday Reminder</h1>

      <input
        placeholder="🔍 Search user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      <form onSubmit={submit} style={cardStyle}>
        <h3>{editingId ? "Edit User" : "Add User"}</h3>

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

        <button style={buttonStyle}>
          {editingId ? "Update ✏️" : "Save 🎉"}
        </button>
      </form>

      <div style={cardStyle}>
        <h3>📋 Users</h3>

        {filteredUsers.map((u) => (
          <div key={u._id} style={userItemStyle}>
            <strong>{u.username}</strong>
            <p>{u.email}</p>
            <small>DOB: {u.dob}</small>
            <br />
            <small>⏳ {getCountdown(u.dob)}</small>

            <div style={{ marginTop: "10px" }}>
              <button onClick={() => editUser(u)} style={editBtn}>
                Edit
              </button>
              <button onClick={() => deleteUser(u._id)} style={deleteBtn}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== STYLES =====
const containerStyle = { padding: 20, textAlign: "center" };
const titleStyle = { color: "#333" };
const cardStyle = {
  background: "white",
  padding: 20,
  margin: "10px auto",
  maxWidth: 400,
  borderRadius: 10,
};
const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};
const buttonStyle = {
  width: "100%",
  padding: 10,
  background: "#667eea",
  color: "white",
  border: "none",
};
const userItemStyle = {
  borderBottom: "1px solid #eee",
  padding: 10,
};
const editBtn = { marginRight: 10 };
const deleteBtn = { background: "red", color: "white" };

export default App;