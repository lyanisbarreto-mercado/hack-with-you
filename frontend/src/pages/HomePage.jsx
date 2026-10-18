import { useState } from "react";
import Search from "../components/Search.jsx";
import Filter from "../components/Filter.jsx";
import MemberCard from "../components/MemberCard.jsx";
import Icon from "../components/Icon.jsx";
import { emptyFilters } from "../lib/tags.js";
import { matchesMember } from "../lib/memberFilters.js";
export default function HomePage({
  members,
  loading,
  error,
  onRetry,
  onOpen,
  onNotes,
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const filtered = members.filter((member) =>
    matchesMember(member, query, filters),
  );
  const count = Object.values(filters).flat().length;
  return (
    <main className="main-content home-page" id="main-content" tabIndex={-1}>
      <div className="home-toolbar">
        <div className="search-tools">
          <Search value={query} onChange={setQuery} />
          <button
            className={`icon-button ${count ? "is-selected" : ""}`}
            aria-label={`Open filters${count ? `, ${count} selected` : ""}`}
            onClick={() => setFilterOpen(true)}
          >
            <Icon name="filter" />
            {count > 0 && <span className="filter-count">{count}</span>}
          </button>
        </div>
        <button className="outline-button" onClick={onNotes}>
          <Icon name="notes" /> Notes
        </button>
      </div>
      <h1 className="sr-only">Find your next teammate</h1>
      {loading ? (
        <p className="status" role="status">
          Finding your next teammates…
        </p>
      ) : error ? (
        <div className="empty-state" role="alert">
          <h2>Couldn’t load members</h2>
          <p>{error}</p>
          <button className="outline-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : filtered.length ? (
        <div className="member-grid">
          {filtered.map((member) => (
            <MemberCard key={member._id} member={member} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="user" size={52} />
          <h2 className="pixel">
            {members.length
              ? "No matching teammates"
              : "Your next team starts here"}
          </h2>
          <p>
            {members.length
              ? "Try a different search or clear your filters."
              : "Members with a username will appear here once they create a profile."}
          </p>
        </div>
      )}
      {filterOpen && (
        <Filter
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onConfirm={(value) => {
            setFilters(value);
            setFilterOpen(false);
          }}
        />
      )}
    </main>
  );
}
