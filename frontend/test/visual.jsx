import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css";
import HomePage from "../src/pages/HomePage.jsx";
import User from "../src/pages/User.jsx";
import NavBar from "../src/components/NavBar.jsx";
import NotesPopup from "../src/components/NotesPopup.jsx";
import EditProfile from "../src/components/EditProfile.jsx";
const members = Array.from({ length: 12 }, (_, index) => ({
  _id: String(index),
  username: `member_${index}`,
  displayName: ["Taylor Smith", "Alex Johnson", "Samantha Lee"][index % 3],
  experience: ["Beginner", "Intermediate", "Advanced"][index % 3],
  technology: [
    ["HTML", "CSS", "React"],
    ["Python", "Java"],
    ["React Native", "SQL"],
  ][index % 3],
  industry: [["Web Development"], ["Cyber Security"], ["Computer Science"]][
    index % 3
  ],
  commitment: [index % 2 ? "Competitive" : "Casual"],
}));
function Preview() {
  const [page, setPage] = useState("home"),
    [profile, setProfile] = useState(members[0]),
    [notes, setNotes] = useState(false),
    [content, setContent] = useState(""),
    [edit, setEdit] = useState(false);
  return (
    <div className="app-shell">
      <div className="app-notice" role="status">Component preview · sample data · changes are not saved</div>
      <NavBar
        page={page}
        isAuthenticated
        onHome={() => setPage("home")}
        onProfile={() => {
          setProfile(members[0]);
          setPage("me");
        }}
        onLogout={() => {}}
      />
      <header className="topbar">
        <span className="wordmark">
          <span>〈</span>“hackWithYou”<span>〉</span>
        </span>
      </header>
      {page === "home" ? (
        <HomePage
          members={members}
          loading={false}
          error=""
          onOpen={(username) => {
            setProfile(members.find((member) => member.username === username));
            setPage("user");
          }}
          onNotes={() => setNotes(true)}
        />
      ) : (
        <User
          profile={profile}
          own={page === "me"}
          onBack={() => setPage("home")}
          onNotes={() => setNotes(true)}
          onEdit={() => setEdit(true)}
        />
      )}
      {notes && (
        <NotesPopup
          content={content}
          onChange={setContent}
          loaded
          loading={false}
          saving={false}
          onSave={() => {}}
          status="Layout preview; not saved"
          onClose={() => setNotes(false)}
        />
      )}
      {edit && (
        <EditProfile
          profile={profile}
          onClose={() => setEdit(false)}
          onSave={async (changes) => {
            setProfile({ ...profile, ...changes });
            setEdit(false);
          }}
        />
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<Preview />);
