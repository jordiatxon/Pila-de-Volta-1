
import React from 'react';

/**
 * Main Application Component
 * 
 * Layout Structure:
 * - Full screen black background.
 * - Split horizontally into Part A (1/3) and Part B (2/3).
 * - Part A: 9/10 Main Content (now empty as per request), 1/10 Footer Credits.
 * - Part B: 3/4 B1, 1/4 B2.
 * - Part B2: Split vertically into B21 (left) and B22 (right).
 */
const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-black text-white font-['Arial'] overflow-hidden">
      
      {/* Part A - Left 1/3 */}
      <div className="w-1/3 flex flex-col border-r border-blue-600 h-full">
        {/* Main A Content (9/10) - Title removed as per user request */}
        <div className="h-[90%] p-4 overflow-auto">
        </div>

        {/* Credits Section (1/10) */}
        <div className="h-[10%] border-t border-blue-600 flex items-center px-4">
          <p className="font-arial-10">
            Jordi Achón, 2026. Llicència: CC BY-NC 4.0. Fet amb Google AI Studio.
          </p>
        </div>
      </div>

      {/* Part B - Right 2/3 */}
      <div className="w-2/3 flex flex-col h-full">
        
        {/* Part B1 (3/4 of height) */}
        <div className="h-3/4 border-b border-blue-600 overflow-hidden">
          {/* B1 Content Area */}
        </div>

        {/* Part B2 (1/4 of height) */}
        <div className="h-1/4 flex w-full">
          
          {/* Part B21 (Vertical division) */}
          <div className="flex-1 border-r border-blue-600 p-4 flex items-center gap-4 overflow-hidden">
            {/* Image adjusted to 1/4 of the total interface height */}
            <div className="h-full flex items-center justify-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1HFw-JhMw3t9PI4G9zmVnNdBcgWbMdb6-" 
                alt="Pila de Volta"
                className="max-h-full object-contain"
                onError={(e) => {
                  // Fallback for environment restrictions on Google Drive direct links
                  (e.target as HTMLImageElement).src = 'https://drive.google.com/uc?export=view&id=1HFw-JhMw3t9PI4G9zmVnNdBcgWbMdb6-';
                }}
              />
            </div>
            <div className="font-arial-11 flex flex-col justify-center space-y-1">
              <p>Pîla de Volta.</p>
              <p>Monedes de 2 cèntims escalfades (Òxid de Coure).</p>
              <p>Cartolina xopada amb vinagre.</p>
              <p>Volanderes cincades (Zinc).</p>
              <p>LED.</p>
            </div>
          </div>

          {/* Part B22 (Vertical division) - Vocabulari del circuit */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="font-arial-11 mb-2">Vocabulari del circuit:</h2>
            <div className="space-y-2">
              
              {/* Electrons lliures */}
              <div className="flex items-center gap-2">
                <div className="w-[2px] h-[2px] rounded-full bg-red-600"></div>
                <span className="font-arial-11">Electrons lliures del conductor.</span>
              </div>

              {/* Electrons alliberats */}
              <div className="flex items-center gap-2">
                <div className="w-[2px] h-[2px] rounded-full bg-red-600"></div>
                <span className="font-arial-11">Electrons alliberats per la química de la bateria.</span>
              </div>

              {/* Ions del Zinc */}
              <div className="flex items-center gap-2">
                <span className="font-arial-15 text-blue-600 font-bold leading-none">+</span>
                <span className="font-arial-11">Ions del Zinc.</span>
              </div>

              {/* Zinc Square */}
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-gray-500"></div>
                <span className="font-arial-11">Zinc</span>
              </div>

              {/* Coure Square */}
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-pink-400"></div>
                <span className="font-arial-11">Coure</span>
              </div>

              {/* Electròlit Square */}
              <div className="flex items-center gap-2">
                <div className="w-[6px] h-[6px] bg-blue-600"></div>
                <span className="font-arial-11">Electròlit</span>
              </div>

              {/* Camp Elèctric */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                  <div className="w-[1px] h-[10px] bg-purple-600"></div>
                </div>
                <span className="font-arial-11">Camp Elèctric.</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
