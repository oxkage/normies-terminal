import React, { useState, useEffect, useRef } from 'react';

// Mock data generator for 40x40 grid (1600 chars)
const generateMockGrid = () => {
  let grid = "";
  for (let i = 0; i < 1600; i++) {
    // Generate a crude pattern (circle-ish)
    const x = i % 40;
    const y = Math.floor(i / 40);
    const cx = 20;
    const cy = 20;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    
    // Add some noise and shape
    if (dist < 15 && Math.random() > 0.2) {
      grid += "1";
    } else {
      grid += "0";
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
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
      const mock = generateMockGrid();
      setGridData(mock);
      setLoading(false);
      startTraitTyping();
    }, 800);
  };

  const startTraitTyping = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= MOCK_TRAITS.length) {
        clearInterval(interval);
        return;
      }
      setTraitsLog(prev => [...prev, MOCK_TRAITS[index]]);
      index++;
    }, 400); // Line by line typing effect
  };

  const copyToClipboard = () => {
    if (!gridData) return;
    
    // Convert grid data to actual copyable text art
    let art = "";
    for (let i = 0; i < 1600; i++) {
      art += gridData[i] === "1" ? "█" : " ";
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
    <div className={`min-h-screen w-full p-4 md:p-8 flex flex-col items-center font-terminal text-xl md:text-2xl transition-colors duration-0 ${isNoir ? 'noir-mode' : ''}`}>
      
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-8 flex justify-between items-start">
        <div className="flex flex-col">
          <span>NORMIE_OS v1.0.0 // TERMINAL ACCESS</span>
          <span className="text-sm opacity-70">MEM: 640KB OK</span>
        </div>
        <button 
          onClick={() => setIsNoir(!isNoir)} 
          className="border border-current px-2 hover:bg-[#48494b] hover:text-[#e3e5e4] transition-colors"
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
              className="bg-transparent border-none outline-none w-24 caret-transparent uppercase"
              autoFocus
            />
            {/* Custom Blinking Cursor Block */}
            <span className="absolute top-0 left-0 pointer-events-none">
              {inputVal}
              <span className="animate-blink inline-block bg-current w-3 h-5 md:w-4 md:h-6 align-middle ml-1"></span>
            </span>
          </div>
        </form>
      </div>

      {/* MAIN DISPLAY (THE BOX) */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* ASCII RENDERER */}
        <div className="border-2 border-current p-2 w-full md:w-auto flex justify-center bg-opacity-10 bg-black/5">
          {loading ? (
            <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center animate-pulse">
              LOADING_DATA_CHUNKS...
            </div>
          ) : gridData ? (
            <div 
              className="grid grid-cols-[repeat(40,1fr)] leading-none"
              style={{ width: 'fit-content' }}
            >
              {gridData.split('').map((char, idx) => (
                <span key={idx} className="w-2 h-2 md:w-2.5 md:h-2.5 flex items-center justify-center">
                  {char === "1" ? "█" : "·"}
                </span>
              ))}
            </div>
          ) : (
            <div className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center text-center opacity-50 border border-dashed border-current">
              [NO SIGNAL]<br/>WAITING FOR INPUT
            </div>
          )}
        </div>

        {/* LOG TRAITS & ACTIONS */}
        <div className="flex-1 w-full space-y-4">
          
          <div className="min-h-[200px] border-l-2 border-current pl-4 flex flex-col gap-1">
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
                className="text-left hover:bg-[#48494b] hover:text-[#e3e5e4] px-1 transition-colors"
              >
                [Y] COPY_TO_CLIPBOARD
              </button>
              <button 
                onClick={postToX}
                className="text-left hover:bg-[#48494b] hover:text-[#e3e5e4] px-1 transition-colors"
              >
                [X] POST_TO_X
              </button>
            </div>
          )}
          
        </div>
      </div>

    </div>
  )
}

export default App
