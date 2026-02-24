import React, { useState, useEffect, useRef } from 'react';

// --- NORMIE PROTOCOL DECODER ---
// Decodes 200 bytes (1600 bits) into a flat array of 0s and 1s
// Format: 40x40, 1 bit per pixel, MSB first
const decodeNormieData = (uint8Array) => {
  const pixels = [];
  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      const flatIndex = y * 40 + x;
      const byteIndex = flatIndex >> 3;      // integer division by 8
      const bitPos = 7 - (flatIndex & 7);    // MSB first
      
      const byte = uint8Array[byteIndex];
      const pixel = (byte >> bitPos) & 1;
      
      pixels.push(pixel);
    }
  }
  return pixels; // Returns Array(1600) of 0 or 1
};

// --- MOCK DATA GENERATOR (Simulates API Response) ---
// Generates a Uint8Array(200) representing a 40x40 image
const generateMockBytes = (seed) => {
  const bytes = new Uint8Array(200);
  const numSeed = parseInt(seed) || 1234;
  
  // Draw a pattern directly into bits
  for (let i = 0; i < 1600; i++) {
    const x = i % 40;
    const y = Math.floor(i / 40);
    
    // Simple generative art logic
    const cx = 20;
    const cy = 20;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    
    let isPixelOn = 0;
    
    // Pattern: Rings + "Glitch" noise based on seed
    if (dist < 18 && dist > 2) {
       if (Math.floor(dist) % 2 === 0) isPixelOn = 1;
    }
    // Add some random noise
    if (((x * y) + numSeed) % 17 === 0) isPixelOn = 1;
    
    // Border
    if (x === 0 || x === 39 || y === 0 || y === 39) isPixelOn = 1;

    // Write bit to byte array
    if (isPixelOn) {
      const byteIndex = i >> 3;
      const bitPos = 7 - (i & 7);
      bytes[byteIndex] |= (1 << bitPos);
    }
  }
  return bytes;
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
  const [gridData, setGridData] = useState(null); // Array of 1600 ints (0 or 1)
  const [loading, setLoading] = useState(false);
  const [traitsLog, setTraitsLog] = useState([]);
  const [isNoir, setIsNoir] = useState(false);
  const inputRef = useRef(null);

  // Focus input on click anywhere (unless clicking button)
  useEffect(() => {
    const handleClick = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
        inputRef.current?.focus();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Sync body background color
  useEffect(() => {
      document.body.style.backgroundColor = isNoir ? '#1a1a1a' : '#e3e5e4';
  }, [isNoir]);

  const handleInputChange = (e) => {
    const val = e.target.value;
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

    // Simulate API Latency
    setTimeout(() => {
      // 1. Get raw bytes (simulating API fetch of 200 bytes)
      const rawBytes = generateMockBytes(inputVal);
      
      // 2. Decode using the specified formula
      const decodedPixels = decodeNormieData(rawBytes);
      
      setGridData(decodedPixels);
      setLoading(false);
      startTraitTyping();
    }, 1000);
  };

  const startTraitTyping = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= MOCK_TRAITS.length) {
        clearInterval(interval);
        return;
      }
      setTraitsLog(prev => {
          if (prev.length > index) return prev;
          return [...prev, MOCK_TRAITS[index]];
      });
      index++;
    }, 300); 
  };

  const copyToClipboard = () => {
    if (!gridData) return;
    let art = "";
    for (let i = 0; i < 1600; i++) {
      art += gridData[i] === 1 ? "█" : " ";
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
      className={`min-h-screen w-full flex flex-col items-center font-terminal text-xl md:text-2xl transition-colors duration-0 p-4 md:p-8
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
            <span className="absolute top-0 left-0 pointer-events-none flex items-center h-full">
              {inputVal}
              <span className="animate-blink inline-block bg-current w-[0.6em] h-[1em] ml-1"></span>
            </span>
          </div>
        </form>
      </div>

      {/* MAIN DISPLAY */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* ART RENDERER */}
        <div className="border-2 border-current p-2 w-full md:w-auto flex justify-center bg-black/5 min-h-[340px]">
          {loading ? (
            <div className="w-[320px] h-[320px] flex items-center justify-center animate-pulse">
              LOADING_DATA_CHUNKS...
            </div>
          ) : gridData ? (
            // FORCE EXACT GRID DIMENSIONS
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(40, 1fr)',
                width: '320px',
                height: '320px',
                lineHeight: 1
              }}
              className="bg-transparent"
            >
              {gridData.map((pixel, idx) => (
                <div 
                    key={idx} 
                    className="w-full h-full flex items-center justify-center text-[8px] select-none"
                    style={{ aspectRatio: '1/1' }}
                >
                  {pixel === 1 ? "█" : "·"}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-[320px] h-[320px] flex items-center justify-center text-center opacity-50 border border-dashed border-current">
              [NO SIGNAL]<br/>WAITING FOR INPUT
            </div>
          )}
        </div>

        {/* METADATA LOG */}
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
  );
}

export default App;
