// components/UploadZone.jsx
import { useState, useRef } from "react";

// ==============================
// Verification Features List
// ==============================

const FEATURES = [
  "AI similarity scan",
  "Reverse image search",
  "Blockchain timestamp",
  "NFT collision check",
  "Certificate minting",
];

// ==============================
// Allowed File Types
// ==============================

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export default function UploadZone({
  file,
  preview,
  analyzing,
  onFile,
  onAnalyze,
  onReset,
}) {

  const [dragging,  setDragging]  = useState(false);
  const [error,     setError]     = useState(null);
  const [fileInfo,  setFileInfo]  = useState(null);
  const fileRef = useRef();

  // ==============================
  // Validate file type and size
  // ==============================

  const validateFile = (f) => {

    // Check file type
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError(`Invalid file type: ${f.type}. Please upload JPG, PNG, WEBP, SVG or GIF.`);
      return false;
    }

    // Check file size (50MB max)
    if (f.size > 50 * 1024 * 1024) {
      setError("File is too large. Maximum size is 50MB.");
      return false;
    }

    setError(null);
    return true;
  };

  // ==============================
  // Handle file selection
  // ==============================

  const handleFile = (f) => {
    if (!f) return;

    if (!validateFile(f)) return;

    // Store file info for display
    setFileInfo({
      name:     f.name,
      size:     (f.size / 1024).toFixed(1),
      type:     f.type,
      lastMod:  new Date(f.lastModified).toLocaleDateString(),
    });

    onFile(f);
  };

  // ==============================
  // Handle drag and drop
  // ==============================

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  // ==============================
  // Handle file input change
  // ==============================

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  // ==============================
  // Handle click on upload zone
  // ==============================

  const handleClick = () => {
    if (!file) fileRef.current.click();
  };

  return (
    <div className="two-col" style={{ marginBottom: 24 }}>

      {/* ==============================
          Left Side — Drop Zone
          ============================== */}

      <div
        className={`upload-zone
          ${dragging  ? "dragging"  : ""}
          ${file      ? "has-file"  : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >

        {/* Scanline effect when dragging */}
        {dragging && (
          <div className="scanline" />
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />

        {/* ==============================
            Preview or Placeholder
            ============================== */}

        {preview ? (

          // Image Preview
          <div>
            <img
              src={preview}
              alt="Artwork preview"
              style={{
                maxWidth:     "100%",
                maxHeight:    180,
                borderRadius: 8,
                border:       "1px solid rgba(0,255,200,0.2)",
                marginBottom: 12,
              }}
            />

            {/* File name under preview */}
            <div
              style={{
                fontSize:   11,
                color:      "var(--accent)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {file?.name}
            </div>
          </div>

        ) : (

          // Upload Placeholder
          <>
            {/* Upload Icon */}
            <div
              style={{
                fontSize:     40,
                marginBottom: 16,
                filter:       "drop-shadow(0 0 8px rgba(0,255,200,0.3))",
              }}
            >
              🖼
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      13,
                color:         "var(--accent)",
                letterSpacing: 2,
                marginBottom:  8,
              }}
            >
              DROP ARTWORK HERE
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize:     11,
                color:        "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              or click to browse files
            </div>

            {/* Accepted formats */}
            <div
              style={{
                display:      "flex",
                gap:          6,
                flexWrap:     "wrap",
                justifyContent: "center",
              }}
            >
              {["PNG", "JPG", "WEBP", "SVG", "GIF"].map((fmt) => (
                <span
                  key={fmt}
                  style={{
                    fontSize:      9,
                    padding:       "2px 8px",
                    borderRadius:  3,
                    border:        "1px solid rgba(0,255,200,0.15)",
                    color:         "var(--text-muted)",
                    fontFamily:    "var(--font-display)",
                    letterSpacing: 1,
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Max size */}
            <div
              style={{
                marginTop:  12,
                fontSize:   10,
                color:      "var(--text-dim)",
              }}
            >
              Max size: 50MB
            </div>
          </>
        )}

        {/* ==============================
            Error Message
            ============================== */}

        {error && (
          <div
            style={{
              marginTop:    12,
              padding:      "8px 12px",
              background:   "rgba(255,68,102,0.1)",
              border:       "1px solid rgba(255,68,102,0.3)",
              borderRadius: 6,
              fontSize:     11,
              color:        "var(--danger)",
            }}
          >
            ⚠ {error}
          </div>
        )}

      </div>

      {/* ==============================
          Right Side — Info Panel
          ============================== */}

      <div className="flex-col">

        {/* ==============================
            File Info Card
            ============================== */}

        <div className="card" style={{ padding: 20 }}>
          <div className="section-label">FILE INFO</div>

          {fileInfo ? (

            // File details
            <div>
              {[
                { label: "Name",     value: fileInfo.name     },
                { label: "Size",     value: `${fileInfo.size} KB` },
                { label: "Type",     value: fileInfo.type     },
                { label: "Modified", value: fileInfo.lastMod  },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display:       "flex",
                    justifyContent: "space-between",
                    padding:       "4px 0",
                    borderBottom:  "1px solid rgba(0,255,200,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize:   10,
                      color:      "var(--text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize:   10,
                      color:      "var(--text-primary)",
                      fontFamily: item.label === "Name"
                        ? "var(--font-mono)"
                        : "var(--font-body)",
                      maxWidth:   140,
                      overflow:   "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

          ) : (

            // Empty state
            <div
              style={{
                fontSize:  11,
                color:     "var(--text-dim)",
                textAlign: "center",
                padding:   "12px 0",
              }}
            >
              No file selected
            </div>
          )}
        </div>

        {/* ==============================
            Verification Features Card
            ============================== */}

        <div className="card" style={{ padding: 20 }}>
          <div className="section-label">VERIFICATION INCLUDES</div>

          {FEATURES.map((f, i) => (
            <div
              key={f}
              style={{
                fontSize:  11,
                color:     "#778899",
                padding:   "5px 0",
                display:   "flex",
                gap:       8,
                animation: `fadeUp 0.3s ease ${i * 0.1}s both`,
              }}
            >
              <span style={{ color: "var(--accent)" }}>▸</span>
              {f}
            </div>
          ))}
        </div>

        {/* ==============================
            Verify Button
            ============================== */}

        <button
          className="btn-primary"
          disabled={!file || analyzing}
          onClick={onAnalyze}
        >
          {analyzing
            ? (
              <span
                style={{
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap:        8,
                }}
              >
                <span
                  style={{
                    width:        12,
                    height:       12,
                    borderRadius: "50%",
                    border:       "2px solid rgba(0,0,0,0.3)",
                    borderTop:    "2px solid #050a0f",
                    animation:    "spin 0.8s linear infinite",
                    display:      "inline-block",
                  }}
                />
                PROCESSING...
              </span>
            )
            : "VERIFY COPYRIGHT ▶"
          }
        </button>

        {/* ==============================
            Clear Button
            Only shows when file selected
            ============================== */}

        {file && (
          <button
            className="btn-ghost"
            onClick={() => {
              setFileInfo(null);
              setError(null);
              onReset();
            }}
          >
            ✕ CLEAR FILE
          </button>
        )}

      </div>
    </div>
  );
}