// pages/Home.jsx
import { useState }        from "react";
import StepProgress        from "../components/StepProgress.jsx";
import UploadZone          from "../components/uploadzone.jsx";
import AnalyzingState      from "../components/AnalyzingState.jsx";
import ResultCard          from "../components/ResultCard.jsx";
import HistoryTab          from "../components/HistoryTab.jsx";

export default function Home() {

  // ==============================
  // State
  // ==============================

  const [step,      setStep]      = useState(0);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [tab,       setTab]       = useState("upload");

  // ==============================
  // Handle file selection
  // ==============================

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(1);
  };

  // ==============================
  // Handle verify button click
  // Simulates AI + blockchain flow
  // Replace with real API call
  // ==============================

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setStep(2);

    try {

      // ==============================
      // Real API call goes here
      // ==============================

      // const formData = new FormData();
      // formData.append("artwork", file);
      // const response = await fetch("/api/verify", {
      //   method: "POST",
      //   body:   formData,
      // });
      // const data = await response.json();

      // ==============================
      // Simulated flow for now
      // ==============================

      // Step 2 — AI analyzing (3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3 — Blockchain write (2 seconds)
      setStep(3);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 4 — Done
      const score = Math.floor(Math.random() * 60) + 35;

      setResult({
        score,
        hash:      "0x" +
          Math.random().toString(16).slice(2, 8) +
          "..." +
          Math.random().toString(16).slice(2, 6),
        certified: score > 70,
        filename:  file?.name,
      });

      setStep(4);

    } catch (error) {
      console.error("[HOME] Verify error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  // ==============================
  // Reset everything
  // ==============================

  const reset = () => {
    setStep(0);
    setFile(null);
    setPreview(null);
    setResult(null);
    setAnalyzing(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ==============================
          Tab Navigation
          ============================== */}

      <div
        style={{
          padding:  "24px 32px 0",
          display:  "flex",
          gap:      8,
          position: "relative",
          zIndex:   20,
        }}
      >
        {[
          { id: "upload",  label: "UPLOAD"  },
          { id: "history", label: "HISTORY" },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}

        {/* Record count badge */}
        {tab === "history" && (
          <div
            style={{
              marginLeft:    "auto",
              fontSize:      10,
              color:         "var(--text-muted)",
              alignSelf:     "center",
              fontFamily:    "var(--font-display)",
              letterSpacing: 1,
            }}
          >
            5 RECORDS
          </div>
        )}
      </div>

      {/* ==============================
          Main Content
          ============================== */}

      <main
        style={{
          padding:   "32px",
          maxWidth:  900,
          margin:    "0 auto",
          position:  "relative",
          zIndex:    20,
        }}
      >

        {/* ==============================
            Upload Tab
            ============================== */}

        {tab === "upload" && (
          <>

            {/* Step Progress */}
            <StepProgress currentStep={step} />

            {/* Upload Zone — shows on step 0 and 1 */}
            {step < 2 && (
              <UploadZone
                file={file}
                preview={preview}
                analyzing={analyzing}
                onFile={handleFile}
                onAnalyze={handleAnalyze}
                onReset={reset}
              />
            )}

            {/* AI Analyzing — shows on step 2 */}
            {step === 2 && (
              <AnalyzingState phase="ai" />
            )}

            {/* Blockchain Writing — shows on step 3 */}
            {step === 3 && (
              <AnalyzingState phase="blockchain" />
            )}

            {/* Result Card — shows on step 4 */}
            {step === 4 && result && (
              <ResultCard
                result={result}
                onReset={reset}
              />
            )}

          </>
        )}

        {/* ==============================
            History Tab
            ============================== */}

        {tab === "history" && (
          <HistoryTab />
        )}

      </main>

    </div>
  );
}