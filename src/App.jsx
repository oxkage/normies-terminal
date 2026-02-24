import React, { useState, useEffect, useRef } from 'react';

// Mock data generator for 40x40 grid (1600 chars)
const generateMockGrid = (seed) => {
  let grid = "";
  const centerX = 20;
  const centerY = 20;
  
  // Use simple pseudo-random based on seed
  const numSeed = parseInt(seed) || 1234;

  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      let char = "0";
      
      // Pattern logic: Concentric rings + interference
      const ring = Math.floor(dist);
      const interference = (x + y + numSeed) % 7 === 0;
      
      if (dist < 18) {
        if (ring % 3 === 0 || interference) {
           char = "1";
        }
      }
      
      // Border frame
      if (x === 0 || x === 39 || y === 0 || y === 39) char = "1";

      grid += char;
    }
  }
  return grid;
};

const MOCK_TRAITS = [
  { label: "TYPE", value: "UNDEAD" },
  { label: "EYES", value: "LASER_RED" },
  { label: "ACCESSORY", value: "VR_HEADSET" },
  { label: "MOUTH", value: "GRIN" },
  { label: "BACKGROUND", value: "VOID" }
];

function App() {
  const [inputVal, setInputVal] = useState("");
  const [gridData, setGridData] = useState(null); // String of 1600 '0's and '1's
  const [loading, setLoading] = useState(false);
  const [traitsLog, setTraitsLog] = useState([]);
  const [isNoir, setIsNoir] = useState(false);
  const inputRef = useRef(null);

  // Focus input on click anywhere
  useEffect(() => {
    const handleClick = (e) => {
        // Prevent focus stealing if clicking buttons or interactive elements
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
        inputRef.current?.focus();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Sync body background color based on theme to prevent white flashes
  useEffect(() => {
      document.body.style.backgroundColor = isNoir ? '#1a1a1a' : '#e3e5e4';
  }, [isNoir]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Only allow numbers, max 4 chars
    if (/^\d{0,4}$/.test(val)) {
      setInputVal(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal) return;
    
    setLoading(true);
    setGridData(null);
    setTraitsLog([]);

    // Simulate API Fetch / Processing
    setTimeout(() => {
      const mock = generateMockGrid(inputVal);
      setGridData(mock);
      setLoading(false);
      startTraitTyping();
    }, 1200);
  };

  const startTraitTyping = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= MOCK_TRAITS.length) {
        clearInterval(interval);
        return;
      }
      setTraitsLog(prev => {
          // Safety check to avoid duplication if interval runs fast
          if (prev.length > index) return prev;
          return [...prev, MOCK_TRAITS[index]];
      });
      index++;
    }, 300); 
  };

  const copyToClipboard = () => {
    if (!gridData) return;
    
    // Convert grid data to actual copyable text art
    let art = "";
    for (let i = 0; i < 1600; i++) {
      art += gridData[i] === "1" ? "█" : " "; // Use space for empty to keep alignment in most editors
      if ((i + 1) % 40 === 0) art += "\n";
    }
    
    navigator.clipboard.writeText(art).then(() => {
      alert("ASCII ART COPIED TO SYSTEM CLIPBOARD");
    });
  };

  const postToX = () => {
    const text = `NORMIE #${inputVal} DETECTED.\n\nTYPE: ${MOCK_TRAITS[0].value}\n\nVia NORMIE_OS v1.0.0`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center font-terminal text-xl md:text-2xl transition-colors duration-300 p-4 md:p-8
      ${isNoir ? 'bg-[#1a1a1a] text-[#e3e5e4]' : 'bg-[#e3e5e4] text-[#48494b]'}`}
    >
      
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-8 flex justify-between items-start select-none">
        <div className="flex flex-col">
          <span>NORMIE_OS v1.0.0 // TERMINAL ACCESS</span>
          <span className="text-sm opacity-70">MEM: 640KB OK</span>
        </div>
        <button 
          onClick={() => setIsNoir(!isNoir)} 
          className="border border-current px-2 hover:opacity-80 transition-opacity"
        >
          [{isNoir ? 'NOIR: ON' : 'NOIR: OFF'}]
        </button>
      </div>

      {/* INPUT AREA */}
      <div className="w-full max-w-2xl mb-8">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span>C:\&gt; ENTER_TOKEN_ID:</span>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              className="bg-transparent border-none outline-none w-24 caret-transparent uppercase p-0 m-0 font-inherit text-inherit"
              autoFocus
            />
            {/* Custom Blinking Cursor Block */}
            <span className="absolute top-0 left-0 pointer-events-none flex items-center h-full">
              {inputVal}
              <span className="animate-blink inline-block bg-current w-[0.6em] h-[1em] ml-1"></span>
            </span>
          </div>
        </form>
      </div>

      {/* MAIN DISPLAY (THE BOX) */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* ASCII RENDERER - FIXED SIZE CONTAINER */}
        <div className="border-2 border-current p-2 w-full md:w-auto flex justify-center bg-black/5 min-h-[340px] md:min-h-[420px]">
          {loading ? (
            <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center animate-pulse">
              LOADING_DATA_CHUNKS...
            </div>
          ) : gridData ? (
            <div 
              className="grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(40, 1fr)',
                width: '320px', // Mobile fixed width
                height: '320px', // Mobile fixed height (square)
              }}
            >
              {/* Responsive scaling via CSS media queries inline or class */}
              <style>{`
                @media (min-width: 768px) {
                  .grid-art-container {
                    width: 400px !important;
                    height: 400px !important;
                  }
                }
              `}</style>
              <div 
                className="grid-art-container grid grid-cols-[repeat(40,1fr)] w-[320px] h-[320px]"
              >
                  {gridData.split('').map((char, idx) => (
                    <div 
                        key={idx} 
                        className="flex items-center justify-center w-full h-full text-[8px] md:text-[10px] leading-none select-none"
                    >
                      {char === "1" ? "█" : "·"}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center text-center opacity-50 border border-dashed border-current">
              [NO SIGNAL]<br/>WAITING FOR INPUT
            </div>
          )}
        </div>

        {/* LOG TRAITS & ACTIONS */}
        <div className="flex-1 w-full space-y-4">
          
          <div className="min-h-[200px] border-l-2 border-current pl-4 flex flex-col gap-1 text-base md:text-xl">
            <span className="border-b border-current w-fit mb-2">Metadata Log:</span>
            
            {loading && <div>> DECRYPTING_METADATA...</div>}
            
            {!loading && traitsLog.map((trait, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-70">[{trait.label}]</span>
                <span>..........</span>
                <span>{trait.value}</span>
              </div>
            ))}
            
            {!loading && traitsLog.length === MOCK_TRAITS.length && (
              <div className="mt-4 animate-pulse">> END_OF_FILE</div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          {!loading && gridData && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-current border-dashed">
              <button 
                onClick={copyToClipboard}
                className="text-left hover:bg-current hover:text-[var(--bg-color)] px-1 transition-colors group"
              >
                <span className="group-hover:text-inherit">[Y] COPY_TO_CLIPBOARD</span>
              </button>
              <button 
                onClick={postToX}
                className="text-left hover:bg-current hover:text-[var(--bg-color)] px-1 transition-colors group"
              >
                <span className="group-hover:text-inherit">[X] POST_TO_X</span>
              </button>
            </div>
          )}
          
        </div>
      </div>

    </div>
  )
}

export default App
