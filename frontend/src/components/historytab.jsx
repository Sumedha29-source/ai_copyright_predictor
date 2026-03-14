// components/HistoryTab.jsx
import { useState } from "react";
import OriginBar    from "./OriginBar.jsx";

// ==============================
// Sample Data
// Replace with real API call
// from backend later
// ==============================

const SAMPLE_RESULTS = [
  {
    id:          "1",
    hash:        "0x3f9a...b24c",
    title:       "Sunset Abstract #12",
    originality: 97,
    status:      "CERTIFIED",
    time:        "2 min ago",
    fileSize:    "2.4 MB",
    network:     "Ethereum Sepolia",
  },
  {
    id:          "2",
    hash:        "0x8c12...e77f",
    title:       "Portrait Study IV",
    originality: 43,
    status:      "FLAGGED",
    time:        "15 min ago",
    fileSize:    "1.8 MB",
    network:     "Ethereum Sepolia",
  },
  {
    id:          "3",
    hash:        "0x1d04...9a3b",
    title:       "Digital Mandala",
    originality: 88,
    status:      "CERTIFIED",
    time:        "1 hr ago",
    fileSize:    "3.1 MB",
    network:     "Ethereum Sepolia",
  },
  {
    id:          "4",
    hash:        "0xab77...34dc",
    title:       "Abstract Flow III",
    originality: 62,
    status:      "CERTIFIED",
    time:        "3 hr ago",
    fileSize:    "4.2 MB",
    network:     "Ethereum Sepolia",
  },
  {
    id:          "5",
    hash:        "0x5e21...cf90",
    title:       "Urban Sketch #7",
    originality: 29,
    status:      "FLAGGED",
    time:        "6 hr ago",
    fileSize:    "0.9 MB",
    network:     "Ethereum Sepolia",
  },
];

// ==============================
// HistoryTab Component
// ==============================

export default function HistoryTab() {

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [expanded, setExpanded] = useState(null);

  // ==============================
  // Filter records by search
  // and status filter
  // ==============================

  const filtered = SAMPLE_RESULTS.filter((r) => {

    // Search filter
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.hash.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesFilter =
      filter === "ALL"       ? true :
      filter === "CERTIFIED" ? r.status === "CERTIFIED" :
      filter === "FLAGGED"   ? r.status === "FLAGGED"   :
      true;

    return matchesSearch && matchesFilter;
  });

  // ==============================
  // Toggle expanded row
  // ==============================

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="card" style={{ padding: 24 }}>

      {/* ==============================
          Header
          ============================== */}

      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          marginBottom:   20,
        }}
      >
        {/* Title */}
        <div className="section-label" style={{ marginBottom: 0 }}>
          RECENT VERIFICATIONS
        </div>

        {/* Live indicator */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        6,
          }}
        >
          <div
            style={{
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   "var(--accent)",
              animation:    "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontSize:      10,
              color:         "var(--accent)",
              fontFamily:    "var(--font-display)",
              letterSpacing: 1,
            }}
          >
            LIVE SYNC
          </span>
        </div>
      </div>

      {/* ==============================
          Search Bar
          ============================== */}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by title or hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width:        "100%",
            background:   "rgba(0,255,200,0.03)",
            border:       "1px solid rgba(0,255,200,0.12)",
            borderRadius: 6,
            padding:      "10px 14px",
            color:        "var(--text-primary)",
            fontFamily:   "var(--font-body)",
            fontSize:     12,
            outline:      "none",
            transition:   "border-color 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(0,255,200,0.4)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0,255,200,0.12)";
          }}
        />
      </div>

      {/* ==============================
          Filter Buttons
          ============================== */}

      <div
        style={{
          display:      "flex",
          gap:          8,
          marginBottom: 20,
        }}
      >
        {["ALL", "CERTIFIED", "FLAGGED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding:       "5px 14px",
              borderRadius:  4,
              border:        `1px solid ${filter === f ? "rgba(0,255,200,0.4)" : "rgba(0,255,200,0.1)"}`,
              background:    filter === f ? "rgba(0,255,200,0.08)" : "transparent",
              color:         filter === f ? "var(--accent)" : "var(--text-muted)",
              fontFamily:    "var(--font-display)",
              fontSize:      10,
              letterSpacing: 1,
              cursor:        "pointer",
              transition:    "all 0.2s ease",
            }}
          >
            {f}
          </button>
        ))}

        {/* Record Count */}
        <span
          style={{
            marginLeft: "auto",
            fontSize:   11,
            color:      "var(--text-muted)",
            alignSelf:  "center",
          }}
        >
          {filtered.length} records
        </span>
      </div>

      {/* ==============================
          Records List
          ============================== */}

      {filtered.length === 0 ? (

        // Empty state
        <div
          style={{
            textAlign: "center",
            padding:   40,
            color:     "var(--text-muted)",
            fontSize:  12,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div>No records found for "{search}"</div>
        </div>

      ) : (

        // Records
        filtered.map((r) => (
          <div key={r.id} className="result-row">

            {/* Main Row */}
            <div
              className="flex-between"
              style={{ cursor: "pointer" }}
              onClick={() => toggleExpand(r.id)}
            >
              {/* Left side */}
              <div>
                {/* Title */}
                <div
                  style={{
                    fontSize:     13,
                    marginBottom: 4,
                    color:        "var(--text-primary)",
                  }}
                >
                  {r.title}
                </div>

                {/* Hash */}
                <div
                  style={{
                    fontSize:   10,
                    color:      "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.hash}
                </div>
              </div>

              {/* Right side */}
              <div style={{ textAlign: "right" }}>

                {/* Status Badge */}
                <div>
                  <span
                    className={`status-badge ${
                      r.status === "CERTIFIED" ? "certified" : "flagged"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Time */}
                <div
                  style={{
                    fontSize:   10,
                    color:      "var(--text-muted)",
                    marginTop:  4,
                  }}
                >
                  {r.time}
                </div>

                {/* Expand Arrow */}
                <div
                  style={{
                    fontSize:   10,
                    color:      "var(--accent)",
                    marginTop:  4,
                    transition: "transform 0.2s ease",
                    transform:  expanded === r.id
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  ▾
                </div>
              </div>
            </div>

            {/* Originality Bar */}
            <OriginBar value={r.originality} />

            {/* ==============================
                Expanded Details
                Shows when row is clicked
                ============================== */}

            {expanded === r.id && (
              <div
                style={{
                  marginTop:    12,
                  padding:      16,
                  background:   "rgba(0,255,200,0.02)",
                  border:       "1px solid rgba(0,255,200,0.08)",
                  borderRadius: 8,
                  animation:    "fadeUp 0.3s ease",
                }}
              >
                {/* Details Grid */}
                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap:                 12,
                    marginBottom:        16,
                  }}
                >
                  {[
                    { label: "FILE SIZE",   value: r.fileSize   },
                    { label: "NETWORK",     value: r.network    },
                    { label: "RECORD ID",   value: `#${r.id}`   },
                    { label: "FULL HASH",   value: r.hash       },
                  ].map((item) => (
                    <div key={item.label}>
                      <div
                        style={{
                          fontSize:      9,
                          color:         "var(--text-muted)",
                          letterSpacing: 2,
                          fontFamily:    "var(--font-display)",
                          marginBottom:  4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize:   11,
                          color:      "var(--text-primary)",
                          fontFamily: item.label === "FULL HASH"
                            ? "var(--font-mono)"
                            : "var(--font-body)",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ fontSize: 10 }}>
                    ⬇ DOWNLOAD CERTIFICATE
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 10 }}
                  >
                    ⎘ VIEW ON ETHERSCAN
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
//
// HistoryTab.jsx
//
// state:
//   - search: search input value
//   - filter: ALL / CERTIFIED / FLAGGED
//   - expanded: which row is expanded
//
// filtered:
//   - filters by search text
//   - filters by status
//
// Header:
//   - RECENT VERIFICATIONS title
//   - LIVE SYNC indicator
//
// Search Bar:
//   - search by title or hash
//
// Filter Buttons:
//   - ALL
//   - CERTIFIED
//   - FLAGGED
//   - record count
//
// Records List:
//   - empty state (shows when no results)
//   - each record row:
//       - title
//       - hash
//       - status badge
//       - time
//       - expand arrow
//       - OriginBar
//       - expanded details (on click):
//           - file size
//           - network
//           - record ID
//           - full hash
//           - download certificate button
//           - view on etherscan button
//
// ---
//
// What it looks like:
//
// RECENT VERIFICATIONS          LIVE SYNC
//
// [ Search by title or hash... ]
//
// ALL  CERTIFIED  FLAGGED           5 records
//
// ---------------------------------------------
// Sunset Abstract #12         CERTIFIED
// 0x3f9a...b24c               2 min ago
// Originality: 97%
// ---------------------------------------------
// Portrait Study IV           FLAGGED
// 0x8c12...e77f               15 min ago
// Originality: 43%
// ---------------------------------------------
//
// ---
//
// When row is expanded:
//
// ---------------------------------------------
// Sunset Abstract #12         CERTIFIED
// 0x3f9a...b24c               2 min ago
// Originality: 97%
//
// +-------------------------------------------+
// | FILE SIZE     NETWORK                     |
// | 2.4 MB        Ethereum Sepolia            |
// |                                           |
// | RECORD ID     FULL HASH                   |
// | #1            0x3f9a...b24c               |
// |                                           |
// | [DOWNLOAD]    [ETHERSCAN]                 |
// +-------------------------------------------+
//
// ---
//
// Quick copy guide
//
// File: HistoryTab.jsx
// Paste into: src/components/HistoryTab.jsx
//
// ---
//
// Location reminder
//
// frontend/
// └── src/
//     └── components/
//         ├── Header.jsx
//         ├── HexGrid.jsx
//         ├── StepProgress.jsx
//         ├── UploadZone.jsx
//         ├── AnalyzingState.jsx
//         ├── ResultCard.jsx
//         ├── OriginBar.jsx
//         └── HistoryTab.jsx     <-- HERE
//
