
import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Constants & Types ---
const RAIL_TOTAL_LENGTH = 2040;
const CONDUCTOR_WIDTH = 15;
const OUTER_WIDTH = 650;
const OUTER_HEIGHT = 400;
const INNER_WIDTH = 620;
const INNER_HEIGHT = 370;
const BATTERY_WIDTH = 150;
const BATTERY_HEIGHT = 75;
const NUM_ELECTRONS = 1000;
const ELECTRON_SPEED = 20; // px/s
const ELECTROLYTE_DEPLETION_RATE = 5; // px/s
const IONS_DEPLETION_RATE = 5; // count/s

interface Point {
  x: number;
  y: number;
  segment: 'top' | 'right' | 'bottom' | 'left';
}

interface Electron {
  trackPos: number;
  transPos: number;
  id: number;
  vibeDelay: number;
  vibeDuration: number;
}

// --- Helper Functions ---

/**
 * Maps linear track position to 2D coordinates.
 * Rail starts at top center and goes clockwise.
 */
const getXY = (trackPos: number, transPos: number): Point => {
  let p = trackPos % RAIL_TOTAL_LENGTH;
  if (p < 0) p += RAIL_TOTAL_LENGTH;

  const s1 = 317.5; // Top Right: (325, 7.5) -> (642.5, 7.5)
  const s2 = 385;   // Right: (642.5, 7.5) -> (642.5, 392.5)
  const s3 = 635;   // Bottom: (642.5, 392.5) -> (7.5, 392.5)
  const s4 = 385;   // Left: (7.5, 392.5) -> (7.5, 7.5)

  if (p < s1) { // Top Right
    return { x: 325 + p, y: 7.5 + transPos, segment: 'top' };
  } else if (p < s1 + s2) { // Right
    return { x: 642.5 - transPos, y: 7.5 + (p - s1), segment: 'right' };
  } else if (p < s1 + s2 + s3) { // Bottom
    return { x: 642.5 - (p - (s1 + s2)), y: 392.5 - transPos, segment: 'bottom' };
  } else if (p < s1 + s2 + s3 + s4) { // Left
    return { x: 7.5 + transPos, y: 392.5 - (p - (s1 + s2 + s3)), segment: 'left' };
  } else { // Top Left
    return { x: 7.5 + (p - (s1 + s2 + s3 + s4)), y: 7.5 + transPos, segment: 'top' };
  }
};

const B1Circuit: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDepleted, setIsDepleted] = useState(false);
  const [electrolyteH, setElectrolyteH] = useState(75);
  const [ionsCount, setIonsCount] = useState(75);
  const [electrons, setElectrons] = useState<Electron[]>(() => 
    Array.from({ length: NUM_ELECTRONS }, (_, i) => ({
      id: i,
      trackPos: Math.random() * RAIL_TOTAL_LENGTH,
      transPos: Math.random() * 15 - 7.5,
      vibeDelay: Math.random() * -2, // Negative delay to desynchronize
      vibeDuration: 0.3 + Math.random() * 0.4
    }))
  );
  
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(null);
  const batteryIntervalRef = useRef<number>(null);

  const resetBattery = () => {
    setElectrolyteH(75);
    setIonsCount(75);
    setIsDepleted(false);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isDepleted) {
      resetBattery();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      if (isOpen && !isDepleted) {
        setElectrons(prev => prev.map(e => ({
          ...e,
          trackPos: (e.trackPos + ELECTRON_SPEED * deltaTime) % RAIL_TOTAL_LENGTH
        })));
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isOpen, isDepleted]);

  useEffect(() => {
    if (isOpen && !isDepleted) {
      batteryIntervalRef.current = window.setInterval(() => {
        setElectrolyteH(h => {
          const newH = Math.max(0, h - ELECTROLYTE_DEPLETION_RATE);
          if (newH === 0) setIsDepleted(true);
          return newH;
        });
        setIonsCount(c => Math.max(0, c - IONS_DEPLETION_RATE));
      }, 1000);
    } else {
      if (batteryIntervalRef.current) clearInterval(batteryIntervalRef.current);
    }
    return () => { if (batteryIntervalRef.current) clearInterval(batteryIntervalRef.current); };
  }, [isOpen, isDepleted]);

  const ions = useMemo(() => {
    const res = [];
    const cols = 15;
    const rows = 5;
    const cellW = 50 / cols;
    const cellH = 75 / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        res.push({ 
          x: c * cellW + (cellW / 2) - 4,
          y: r * cellH + (cellH / 2) - 6
        });
      }
    }
    return res;
  }, []);

  const [batElectrons, setBatElectrons] = useState<{x: number, y: number, id: number, start: number}[]>([]);
  useEffect(() => {
    if (isOpen && !isDepleted) {
      const interval = setInterval(() => {
        const id = Math.random();
        setBatElectrons(prev => [...prev, {
          id,
          x: 350 + Math.random() * 50,
          y: Math.random() * 75,
          start: Date.now()
        }]);
        setTimeout(() => setBatElectrons(prev => prev.filter(e => e.id !== id)), 1000);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isOpen, isDepleted]);

  const bulbColor = (isOpen && !isDepleted) ? '#fbbf24' : '#d1d5db';

  // Generate field lines every 40px
  const fieldLinesGenerated = useMemo(() => {
    const lines = [];
    for (let p = 0; p < RAIL_TOTAL_LENGTH; p += 40) {
      const pos = getXY(p, 0);
      // Skip lines overlapping the battery
      if (pos.segment === 'top' && pos.x >= 250 && pos.x <= 400) continue;
      lines.push(pos);
    }
    return lines;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pt-[25px]">
      <h1 className="font-arial-14 text-center mb-8 uppercase absolute top-[25px] w-full">
        REPRESENTACIÓ DEL CIRCUIT DE CORRENT CONTINU
      </h1>
      
      <div className="relative" style={{ width: OUTER_WIDTH, height: OUTER_HEIGHT }}>
        {/* Bulb */}
        <div 
          className="absolute rounded-full transition-colors duration-300"
          style={{
            width: 80, height: 80,
            left: 325.5 - 40, top: 392.5 - 40,
            backgroundColor: bulbColor,
            zIndex: 1
          }}
        />

        {/* Conductor Path */}
        <div 
          className="absolute border-[15px] border-white"
          style={{
            width: OUTER_WIDTH, height: OUTER_HEIGHT,
            left: 0, top: 0,
            zIndex: 2
          }}
        />

        {/* Electrons Layer */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          {electrons.map(e => {
            const pos = getXY(e.trackPos, e.transPos);
            const isUnderBattery = pos.x >= 250 && pos.x <= 400 && pos.y >= -30 && pos.y <= 45;
            const isUnderSwitch = !isOpen && pos.x > 400 && pos.x < 430 && pos.y < 20;
            if (isUnderBattery || isUnderSwitch) return null;
            return (
              <div 
                key={e.id}
                className={`absolute bg-red-600 rounded-full ${!isOpen ? 'vibrating' : ''}`}
                style={{
                  width: 2, height: 2,
                  left: pos.x,
                  top: pos.y,
                  // @ts-ignore
                  '--delay': `${e.vibeDelay}s`,
                  '--duration': `${e.vibeDuration}s`
                }}
              />
            );
          })}
        </div>

        {/* Electric Field (Perpendicular) at 40px intervals */}
        {(isOpen && !isDepleted) && fieldLinesGenerated.map((f, i) => {
          const isVert = f.segment === 'top' || f.segment === 'bottom';
          return (
            <div 
              key={i}
              className="absolute bg-purple-600"
              style={{
                width: isVert ? 2 : 60,
                height: isVert ? 60 : 2,
                left: f.x - (isVert ? 1 : 30),
                top: f.y - (isVert ? 30 : 1),
                zIndex: 4
              }}
            />
          );
        })}

        {/* Battery Container */}
        <div 
          className="absolute flex bg-white"
          style={{
            width: BATTERY_WIDTH, height: BATTERY_HEIGHT,
            left: (OUTER_WIDTH - BATTERY_WIDTH) / 2, 
            top: 7.5 - (BATTERY_HEIGHT / 2),
            zIndex: 10
          }}
        >
          <div className="flex-1 bg-[#d1d5db] relative overflow-hidden">
            {ions.slice(0, ionsCount).map((ion, i) => (
              <span 
                key={i} 
                className="absolute text-blue-600 font-arial-12 font-bold leading-none pointer-events-none"
                style={{ left: ion.x, top: ion.y }}
              >+</span>
            ))}
          </div>
          <div className="flex-1 relative bg-white">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-300 transition-all duration-300"
              style={{ height: electrolyteH }}
            />
          </div>
          <div className="flex-1 bg-pink-200 relative overflow-hidden">
             {batElectrons.map(be => {
               const progress = (Date.now() - be.start) / 1000;
               const currX = be.x - 350 + (50 - (be.x - 350)) * progress;
               const currY = be.y + (37.5 - be.y) * progress;
               return (
                 <div 
                  key={be.id}
                  className="absolute bg-red-600 rounded-full"
                  style={{
                    width: 3, height: 3,
                    left: currX,
                    top: currY,
                    opacity: 1 - progress
                  }}
                 />
               );
             })}
          </div>
          <div className="absolute top-[80px] left-0 w-full flex justify-between px-6">
             <span className="text-purple-600 font-bold" style={{ fontSize: 30 }}>+</span>
             <span className="text-purple-600 font-bold" style={{ fontSize: 30 }}>-</span>
          </div>
        </div>

        {/* Switch Polsador */}
        {!isOpen && (
          <div 
            className="absolute bg-black"
            style={{
              width: 30, height: 20,
              left: 400, top: 7.5 - 10,
              zIndex: 11
            }}
          />
        )}

        {/* Toggle Button styled more like a button and centered relative to the conductor frame */}
        <div className="absolute w-full flex justify-center" style={{ top: '55%', zIndex: 20 }}>
            <button 
              onClick={handleToggle}
              className="bg-black/80 border-2 border-white rounded-xl px-8 py-4 hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg"
              style={{
                fontFamily: 'Arial',
                fontSize: 16,
                color: 'white',
                minWidth: '280px'
              }}
            >
              {isDepleted ? "Bateria esgotada. Torna a carregar-la." : "Clic per obrir/tancar el circuit"}
            </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-black text-white font-['Arial'] overflow-hidden text-[12px]">
      
      {/* Part A - Left 1/3 */}
      <div className="w-1/3 flex flex-col border-r border-blue-600 h-full">
        <div className="h-[90%] p-4 overflow-auto">
        </div>
        <div className="h-[10%] border-t border-blue-600 flex items-center px-4">
          <p className="font-arial-10">
            Jordi Achón, 2026. Llicència: CC BY-NC 4.0. Fet amb Google AI Studio.
          </p>
        </div>
      </div>

      {/* Part B - Right 2/3 */}
      <div className="w-2/3 flex flex-col h-full">
        <div className="h-3/4 border-b border-blue-600 overflow-hidden bg-black">
          <B1Circuit />
        </div>
        <div className="h-1/4 flex w-full">
          <div className="flex-1 border-r border-blue-600 p-4 flex items-center gap-4 overflow-hidden">
            <div className="h-full flex items-center justify-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1HFw-JhMw3t9PI4G9zmVnNdBcgWbMdb6-" 
                alt="Pila de Volta"
                className="max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1HFw-JhMw3t9PI4G9zmVnNdBcgWbMdb6-';
                }}
              />
            </div>
            <div className="font-arial-12 flex flex-col justify-center space-y-1">
              <p>Pîla de Volta.</p>
              <p>Monedes de 2 cèntims escalfades (Òxid de Coure).</p>
              <p>Cartolina xopada amb vinagre.</p>
              <p>Volanderes cincades (Zinc).</p>
              <p>LED.</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="font-arial-12 font-bold mb-2">Vocabulari del circuit:</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-[2px] h-[2px] rounded-full bg-red-600"></div>
                <span className="font-arial-12">Electrons lliures del conductor.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[2px] h-[2px] rounded-full bg-red-600"></div>
                <span className="font-arial-12">Electrons alliberats per la química de la bateria.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-arial-15 text-blue-600 font-bold leading-none">+</span>
                <span className="font-arial-12">Ions del Zinc.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-gray-500"></div>
                <span className="font-arial-12">Zinc</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-pink-400"></div>
                <span className="font-arial-12">Coure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-blue-600"></div>
                <span className="font-arial-12">Electròlit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                </div>
                <span className="font-arial-12">Camp Elèctric.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
