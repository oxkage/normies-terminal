import React, { useState, useEffect, useRef } from 'react';

// --- BRAILLE ENCODER (COMPRESSION) ---
// Compresses 40x40 grid into 20x10 Braille characters (200 chars total)
// This fits within Twitter's 280 char limit!
const encodeToBraille = (pixels) => {
  let output = "";
  // Braille pattern: 2 columns x 4 rows per character
  // iterate grid in 4-row chunks, then 2-col chunks
  for (let y = 0; y < 40; y += 4) {
    for (let x = 0; x < 40; x += 2) {
      let byte = 0;
      
      // Map pixel positions to Braille bitmask offsets
      // (0,0)=1, (0,1)=2, (0,2)=4, (1,0)=8, (1,1)=16, (1,2)=32, (0,3)=64, (1,3)=128
      
      // Col 1
      if (pixels[(y + 0) * 40 + (x + 0)]) byte |= 1;
      if (pixels[(y + 1) * 40 + (x + 0)]) byte |= 2;
      if (pixels[(y + 2) * 40 + (x + 0)]) byte |= 4;
      if (pixels[(y + 3) * 40 + (x + 0)]) byte |= 64;
      
      // Col 2
      if (pixels[(y + 0) * 40 + (x + 1)]) byte |= 8;
      if (pixels[(y + 1) * 40 + (x + 1)]) byte |= 16;
      if (pixels[(y + 2) * 40 + (x + 1)]) byte |= 32;
      if (pixels[(y + 3) * 40 + (x + 1)]) byte |= 128;
      
      // Unicode Braille base is 0x2800
      output += String.fromCharCode(0x2800 + byte);
    }
    output += "\n";
  }
  return output;
};

// Use relative path for Vercel/Vite Proxy to handle CORS
const API_BASE = "/api/normie";

function App() {
  const [inputVal, setInputVal] = useState("");
  const [gridData, setGridData] = useState(null); // Array of 1600 ints (0 or 1)
  const [loading, setLoading] = useState(false);
  const [traitsLog, setTraitsLog] = useState([]);
  const [fullTraits, setFullTraits] = useState([]);
  const [isNoir, setIsNoir] = useState(false);
  const [outputMode, setOutputMode] = useState("BLOCKS"); // BLOCKS | BRAILLE
  const [errorMsg, setErrorMsg] = useState(null);
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
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal) return;
    
    setLoading(true);
    setGridData(null);
    setTraitsLog([]);
    setFullTraits([]);
    setErrorMsg(null);

    try {
        // Parallel Fetch: Pixels & Traits
        // Uses relative path proxied by Vite/Vercel to avoid CORS
        const [pixelsRes, traitsRes] = await Promise.all([
            fetch(`${API_BASE}/${inputVal}/pixels`),
            fetch(`${API_BASE}/${inputVal}/traits`)
        ]);

        if (pixelsRes.status === 404 || traitsRes.status === 404) {
            throw new Error("ID_NOT_FOUND");
        }
        if (!pixelsRes.ok || !traitsRes.ok) {
            throw new Error(`API_ERROR_${pixelsRes.status}`);
        }

        const pixelsText = await pixelsRes.text();
        const pixelsArray = pixelsText.split('').map(char => parseInt(char, 10));

        const traitsJson = await traitsRes.json();
        const formattedTraits = traitsJson.attributes.map(attr => ({
            label: attr.trait_type.toUpperCase(),
            value: attr.value.toString().toUpperCase()
        }));

        setGridData(pixelsArray);
        setFullTraits(formattedTraits);
        setLoading(false);
        startTraitTyping(formattedTraits);

    } catch (err) {
        console.error(err);
        setLoading(false);
        setErrorMsg(err.message || "UNKNOWN_ERROR");
    }
  };

  const startTraitTyping = (traitsToType) => {
    let index = 0;
    setTraitsLog([]);
    const interval = setInterval(() => {
      if (index >= traitsToType.length) {
        clearInterval(interval);
        return;
      }
      const currentTrait = traitsToType[index];
      setTraitsLog(prev => [...prev, currentTrait]);
      index++;
    }, 200);
  };

  const copyToClipboard = () => {
    if (!gridData) return;
    
    let textToCopy = "";

    if (outputMode === "BLOCKS") {
      // Optimized for Discord Code Blocks
      textToCopy = "```\n";
      for (let i = 0; i < 1600; i++) {
        textToCopy += gridData[i] === 1 ? "█" : " ";
        if ((i + 1) % 40 === 0) textToCopy += "\n";
      }
      textToCopy += "```";
      alert("COPIED RAW BLOCKS (BEST FOR DISCORD)");
    } else {
      // Optimized for Twitter/Telegram (Braille)
      textToCopy = encodeToBraille(gridData);
      alert("COPIED BRAILLE COMPRESSED (BEST FOR X/TELEGRAM)");
    }
    
    navigator.clipboard.writeText(textToCopy);
  };

  const postToX = () => {
    const typeTrait = fullTraits.find(t => t.label === "TYPE")?.value || "UNKNOWN";
    
    // Always use Braille for Twitter intent because Blocks are too large
    const art = encodeToBraille(gridData);
    
    const text = `${art}\n\nNORMIE #${inputVal} // ${typeTrait}\n\nTerm: https://normies-terminal.vercel.app/`;
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
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
          </div>
          {errorMsg && (
             <div className="text-red-500 animate-pulse text-base">
               >> SYSTEM_ERROR: {errorMsg}
             </div>
          )}
        </form>
      </div>

      {/* MAIN DISPLAY */}
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* ART RENDERER */}
        <div className="border-2 border-current p-2 w-full md:w-auto flex justify-center bg-black/5 min-h-[340px]">
          {loading ? (
            <div className="w-[320px] h-[320px] flex items-center justify-center animate-pulse">
              ACCESSING_CHAIN_DATA...
            </div>
          ) : gridData ? (
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
            
            {!loading && fullTraits.length > 0 && traitsLog.length === fullTraits.length && (
              <div className="mt-4 animate-pulse">> END_OF_FILE</div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          {!loading && gridData && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-current border-dashed">
              <div className="flex flex-col gap-1 mb-4 border-b border-current pb-2">
                 <button 
                  onClick={() => setOutputMode(outputMode === "BLOCKS" ? "BRAILLE" : "BLOCKS")}
                  className="text-left text-sm hover:opacity-100 opacity-70"
                 >
                   [MODE: {outputMode}]
                 </button>
                 <span className="text-xs opacity-50 italic">
                   {outputMode === "BLOCKS" 
                     ? ">> USE FOR DISCORD / DESKTOP (LARGE GRID)" 
                     : ">> USE FOR TWITTER / MOBILE (COMPRESSED BRAILLE)"}
                 </span>
              </div>

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
                <span className="group-hover:text-inherit">[X] POST_TO_X (BRAILLE)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
