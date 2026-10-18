export default function Wordmark({ className = "" }) {
  return (
    <span className={`wordmark ${className}`} aria-label="Hack With You">
      <span aria-hidden="true">〈</span>
      <span className="wordmark-name">“hackWithYou”</span>
      <span aria-hidden="true">〉</span>
    </span>
  );
}
