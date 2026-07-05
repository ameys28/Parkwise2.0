import { useState } from 'react';
import { FaCar, FaInfoCircle } from 'react-icons/fa';

const CarGraphic = ({ color = 'bg-blue-600 border-blue-800' }) => (
  <div className="relative w-20 h-10 mx-auto flex items-center justify-center transition-all duration-500 hover:scale-105">
    {/* Car body */}
    <div className={`absolute w-16 h-7 rounded-lg shadow-md border flex items-center justify-between px-1 ${color}`}>
      {/* Headlights */}
      <div className="w-1 h-2 bg-yellow-200 rounded-l-sm"></div>
      {/* Roof window */}
      <div className="w-8 h-4 bg-sky-100/90 rounded border border-sky-300 flex items-center justify-center">
        <div className="w-4 h-2 bg-sky-200/50 rounded-sm"></div>
      </div>
      {/* Taillights */}
      <div className="w-1 h-2 bg-red-400 rounded-r-sm"></div>
      {/* Tires */}
      <div className="absolute -top-1 left-3 w-3 h-1.5 bg-zinc-800 rounded-t-sm"></div>
      <div className="absolute -top-1 right-3 w-3 h-1.5 bg-zinc-800 rounded-t-sm"></div>
      <div className="absolute -bottom-1 left-3 w-3 h-1.5 bg-zinc-800 rounded-b-sm"></div>
      <div className="absolute -bottom-1 right-3 w-3 h-1.5 bg-zinc-800 rounded-b-sm"></div>
    </div>
  </div>
);

const ParkingMap = ({ slotsList, onSlotClick }) => {
  const [activeLevel, setActiveLevel] = useState('L1');
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Group slots by level. Safe fallback if level is undefined.
  const slotsForLevel = slotsList.filter((slot) => {
    if (!slot.level) {
      // Fallback: Partition by slots list index
      const index = slotsList.indexOf(slot);
      return activeLevel === 'L1' ? index < slotsList.length / 2 : index >= slotsList.length / 2;
    }
    return slot.level.toUpperCase() === activeLevel;
  });

  // Sort slots by slot number so they display in order
  const sortedSlots = [...slotsForLevel].sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));

  // Split slots into top row and bottom row for floor plan grid
  const halfLength = Math.ceil(sortedSlots.length / 2);
  const topRow = sortedSlots.slice(0, halfLength);
  const bottomRow = sortedSlots.slice(halfLength);

  // Helper to resolve plate info from slots
  const getOccupantDetails = (slot) => {
    if (slot.status === 'MAINTENANCE') {
      return null;
    }
    // If occupied or reserved, check active booking or logs
    const booking = slot.bookings && slot.bookings[0];
    if (booking && slot.status !== 'AVAILABLE') {
      return {
        plate: booking.vehicle?.numberPlate || 'UNKNOWN',
        resident: booking.user?.fullName || booking.user?.username || 'Resident',
        status: slot.status,
      };
    }
    
    // In case slot status is OCCUPIED but no active booking (Guest session)
    if (slot.status === 'OCCUPIED') {
      return {
        plate: 'GUEST CAR',
        resident: 'Visitor',
        status: 'OCCUPIED',
      };
    }

    return null;
  };

  return (
    <div className="parking-map-container p-6 rounded-2xl shadow-md border border-slate-200 bg-white text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-3xl font-bold text-indigo-650 flex items-center">
            <FaInfoCircle className="mr-2 text-xl text-indigo-500" />
            Interactive Parking Lot Map
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Real-time visual map representing current parking garage status. Hover over slots for details. {onSlotClick && <span className="text-indigo-600 font-semibold">(Click slot to toggle Maintenance)</span>}
          </p>
        </div>
        
        {/* Level Selectors */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl space-x-1 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveLevel('L1')}
            className={`px-6 py-2 rounded-lg font-bold transition duration-300 ${
              activeLevel === 'L1'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Level 1 (L1)
          </button>
          <button
            onClick={() => setActiveLevel('L2')}
            className={`px-6 py-2 rounded-lg font-bold transition duration-300 ${
              activeLevel === 'L2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Level 2 (L2)
          </button>
        </div>
      </div>

      {/* Main Garage Layout Map Scroll Wrapper */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 shadow-inner scrollbar-thin bg-zinc-950">
        <div className="relative p-6 min-w-[700px] bg-zinc-950">
          {/* Top Parking Row */}
          <div className="flex justify-around mb-2">
            {topRow.map((slot) => {
              const occupant = getOccupantDetails(slot);
              return (
                <SlotCell
                  key={slot.id}
                  slot={slot}
                  occupant={occupant}
                  onMouseEnter={() => setHoveredSlot(slot.id)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  isHovered={hoveredSlot === slot.id}
                  isTopRow={true}
                  onClick={onSlotClick}
                />
              );
            })}
          </div>

          {/* Driving Lane */}
          <div className="h-16 bg-slate-900/60 border-y-2 border-dashed border-indigo-500/20 flex items-center justify-center my-6 relative shadow-inner">
            <div className="absolute left-4 text-xs font-bold text-indigo-500/30 uppercase tracking-widest pointer-events-none">
              ◀ Drive Slow
            </div>
            <div className="text-sm font-bold text-slate-400/40 uppercase tracking-widest pointer-events-none select-none">
              ◀ ◀ ◀ &nbsp; Driving Lane - Level {activeLevel} &nbsp; ◀ ◀ ◀
            </div>
            <div className="absolute right-4 text-xs font-bold text-indigo-500/30 uppercase tracking-widest pointer-events-none">
              Exit ◀
            </div>
          </div>

          {/* Bottom Parking Row */}
          <div className="flex justify-around mt-2">
            {bottomRow.map((slot) => {
              const occupant = getOccupantDetails(slot);
              return (
                <SlotCell
                  key={slot.id}
                  slot={slot}
                  occupant={occupant}
                  onMouseEnter={() => setHoveredSlot(slot.id)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  isHovered={hoveredSlot === slot.id}
                  isTopRow={false}
                  onClick={onSlotClick}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex justify-center flex-wrap gap-6 mt-6 pt-4 border-t border-slate-200 text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"></span>
          <span className="font-semibold text-slate-500">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
          <span className="font-semibold text-slate-500">Reserved</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
          <span className="font-semibold text-slate-500">Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-orange-600 shadow-[0_0_6px_#ea580c] animate-pulse"></span>
          <span className="font-semibold text-slate-500">Maintenance</span>
        </div>
      </div>
    </div>
  );
};

const SlotCell = ({ slot, occupant, onMouseEnter, onMouseLeave, isHovered, isTopRow, onClick }) => {
  const isOccupied = slot.status === 'OCCUPIED';
  const isReserved = slot.status === 'RESERVED';
  const isMaintenance = slot.status === 'MAINTENANCE';
  
  // Decide slot borders and indicator glow
  let spotBorder = 'border-slate-700/60 hover:bg-slate-900/40';
  let indicatorGlow = 'bg-green-500 shadow-[0_0_8px_#22c55e]';
  
  if (isOccupied) {
    spotBorder = 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10';
    indicatorGlow = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
  } else if (isReserved) {
    spotBorder = 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10';
    indicatorGlow = 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
  } else if (isMaintenance) {
    spotBorder = 'border-orange-600/40 bg-orange-600/5 hover:bg-orange-600/10 stripe-bg';
    indicatorGlow = 'bg-orange-600 shadow-[0_0_8px_#ea580c] animate-pulse';
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick && onClick(slot)}
      className={`relative w-28 h-32 border-x-2 border-dashed ${spotBorder} bg-zinc-900/30 flex flex-col justify-between p-2 text-center transition duration-300 cursor-pointer ${
        isTopRow ? 'border-b-2 rounded-b-md' : 'border-t-2 rounded-t-md'
      }`}
    >
      {/* Indicator Light */}
      <div className={`w-3 h-3 rounded-full mx-auto ${indicatorGlow}`}></div>

      {/* Center Slot Content */}
      <div className="my-auto flex flex-col justify-center items-center h-full">
        {isOccupied ? (
          <>
            <CarGraphic color="bg-indigo-600 border-indigo-700 text-white" />
            <div className="text-[10px] font-bold font-mono text-slate-300 mt-1 select-all uppercase">
              {occupant?.plate}
            </div>
          </>
        ) : isReserved ? (
          <div className="text-center">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Reserved</div>
            <div className="text-[9px] font-bold font-mono text-slate-300 bg-amber-500/20 px-1.5 py-0.5 rounded mt-1 uppercase">
              {occupant?.plate}
            </div>
          </div>
        ) : isMaintenance ? (
          <div className="text-center">
            <svg className="w-7 h-7 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-[9px] font-bold text-orange-500 uppercase tracking-wide mt-1">Maintenance</div>
          </div>
        ) : (
          <div className="text-green-500/10 font-black text-xs select-none">VACANT</div>
        )}
      </div>

      {/* Spot Identifier */}
      <div className="text-slate-500 font-bold text-sm tracking-wide">{slot.slotNumber}</div>

      {/* Hover Tooltip Details */}
      {isHovered && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 w-48 p-3 rounded-xl shadow-2xl border bg-slate-950 text-white text-left text-xs ${
            isTopRow ? 'top-full mt-2' : 'bottom-full mb-2'
          } ${isOccupied ? 'border-red-500' : isReserved ? 'border-amber-500' : isMaintenance ? 'border-orange-500' : 'border-green-500'}`}
        >
          <div className="font-bold border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
            <span>Slot: {slot.slotNumber}</span>
            <span className={`uppercase font-extrabold text-[9px] ${
              isOccupied ? 'text-red-500' : isReserved ? 'text-amber-500' : isMaintenance ? 'text-orange-500' : 'text-green-500'
            }`}>{slot.status}</span>
          </div>
          <div>Level: {slot.level || 'L1'}</div>
          {isMaintenance ? (
            <div className="mt-1 text-orange-400 font-medium">Locked for repairs & maintenance.</div>
          ) : occupant ? (
            <div className="mt-1.5 space-y-1">
              <div>
                <span className="text-slate-500">Plate:</span>{' '}
                <span className="font-mono font-bold text-indigo-400">{occupant.plate}</span>
              </div>
              <div>
                <span className="text-slate-500">Owner:</span>{' '}
                <span className="font-semibold text-slate-300">{occupant.resident}</span>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-green-400">Available to park or reserve.</div>
          )}
          {onClick && (
            <div className="mt-2 pt-1 border-t border-slate-900 text-[10px] text-indigo-400 text-center font-bold">
              Click to toggle Maintenance
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingMap;
