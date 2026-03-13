// components/HexGrid.jsx
export default function HexGrid() {
  return (
    <svg
      className="hex-bg"
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >

      {/* ==============================
          Hexagon Grid
          10 columns x 8 rows = 80 hexagons
          ============================== */}

      {Array.from({ length: 80 }).map((_, i) => {

        // Calculate column and row
        const col = i % 10;
        const row = Math.floor(i / 10);

        // Offset every other row by half a hex width
        // Creates honeycomb pattern
        const x = col * 90 + (row % 2 === 0 ? 0 : 45);
        const y = row * 78;

        // Calculate opacity based on position
        // Center hexagons are more visible
        const distFromCenter = Math.abs(col - 5) + Math.abs(row - 4);
        const opacity = Math.max(0.3, 1 - distFromCenter * 0.08);

        return (
          <polygon
            key={i}
            points={`
              ${x + 40},${y}
              ${x + 80},${y + 22}
              ${x + 80},${y + 66}
              ${x + 40},${y + 88}
              ${x},${y + 66}
              ${x},${y + 22}
            `}
            stroke="#00ffcc"
            strokeWidth="1"
            fill="none"
            opacity={opacity}
          />
        );
      })}

      {/* ==============================
          Glowing Center Hexagons
          Extra glow on a few center hexes
          ============================== */}

      {[
        { col: 4, row: 3 },
        { col: 5, row: 3 },
        { col: 4, row: 4 },
        { col: 5, row: 4 },
        { col: 3, row: 4 },
      ].map((pos, i) => {
        const x = pos.col * 90 + (pos.row % 2 === 0 ? 0 : 45);
        const y = pos.row * 78;

        return (
          <polygon
            key={`glow-${i}`}
            points={`
              ${x + 40},${y}
              ${x + 80},${y + 22}
              ${x + 80},${y + 66}
              ${x + 40},${y + 88}
              ${x},${y + 66}
              ${x},${y + 22}
            `}
            stroke="#00ffcc"
            strokeWidth="1.5"
            fill="rgba(0,255,200,0.02)"
            opacity="0.8"
          />
        );
      })}

      {/* ==============================
          Corner Accent Lines
          Decorative lines in corners
          ============================== */}

      {/* Top left corner */}
      <line
        x1="0"   y1="0"
        x2="80"  y2="0"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />
      <line
        x1="0"  y1="0"
        x2="0"  y2="80"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />

      {/* Top right corner */}
      <line
        x1="720"  y1="0"
        x2="800"  y2="0"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />
      <line
        x1="800"  y1="0"
        x2="800"  y2="80"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />

      {/* Bottom left corner */}
      <line
        x1="0"   y1="520"
        x2="0"   y2="600"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />
      <line
        x1="0"   y1="600"
        x2="80"  y2="600"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />

      {/* Bottom right corner */}
      <line
        x1="800"  y1="520"
        x2="800"  y2="600"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />
      <line
        x1="720"  y1="600"
        x2="800"  y2="600"
        stroke="rgba(0,255,200,0.3)"
        strokeWidth="1"
      />

    </svg>
  );
}
// ---
//
// What each part does
//
// HexGrid.jsx
// svg wrapper
//   className="hex-bg"   → positioned absolute
//   viewBox              → 800x600 canvas
//   aria-hidden          → hidden from screen readers
//
// 80 hexagons (10 cols x 8 rows)
//   col = i % 10         → column position
//   row = Math.floor     → row position
//   x offset             → honeycomb pattern
//     odd rows shift right by 45px
//   opacity calculation
//     center hexagons brighter
//   polygon points
//     6 corner coordinates
//
// 5 glowing center hexagons
//   slightly brighter stroke
//   subtle fill
//   positioned in center
//
// corner accent lines
//   top left corner
//   top right corner
//   bottom left corner
//   bottom right corner

