import Icon from "./Icon.jsx";
export default function Search({ value, onChange }) {
  return (
    <label className="search-box">
      <Icon name="search" size={20} />
      <span className="sr-only">Search members</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search members"
      />
    </label>
  );
}
