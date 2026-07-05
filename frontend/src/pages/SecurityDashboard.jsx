// src/pages/SecurityDashboard.js

import { useState, useEffect, useRef } from "react";
import ParkingMap from "../components/ParkingMap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import { addLog, getBookings, getLogs, getSlots, getVehicles, patchSlot } from "../services/api";

const SecurityDashboard = () => {
  const [parkingLogs, setParkingLogs] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [slotsList, setSlotsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logsRef = useRef([]);
  const bookingsRef = useRef([]);

  useEffect(() => {
    logsRef.current = parkingLogs;
  }, [parkingLogs]);

  useEffect(() => {
    bookingsRef.current = bookingsList;
  }, [bookingsList]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [logsData, vehiclesData] = await Promise.all([
        getLogs(),
        getVehicles(),
      ]);
      const [slotsData, bookingsData] = await Promise.all([
        getSlots(),
        getBookings(),
      ]);
      
      const newLogs = Array.isArray(logsData) ? logsData : logsData?.Items || [];
      const newBookings = Array.isArray(bookingsData) ? bookingsData : [];

      if (silent) {
        const currentLogs = logsRef.current;
        const currentBookings = bookingsRef.current;

        // Compare logs for new entries or exits
        if (newLogs.length > currentLogs.length) {
          const addedLogs = newLogs.filter(nl => !currentLogs.some(cl => cl.id === nl.id));
          addedLogs.forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            if (log.action === 'Entry') {
              toast.info(`🔔 Vehicle check-in: ${log.numberPlate} entered the garage at ${timeStr}`);
            } else {
              toast.info(`🔔 Vehicle check-out: ${log.numberPlate} exited the garage at ${timeStr}`);
            }
          });
        }

        // Compare bookings for new reservations
        if (newBookings.length > currentBookings.length) {
          const newRes = newBookings.filter(nb => !currentBookings.some(ob => ob.id === nb.id));
          newRes.forEach(booking => {
            toast.success(`📅 New Resident Reservation: ${booking.vehicle?.numberPlate} booked slot ${booking.slot?.slotNumber || booking.slotId}`);
          });
        }
      }

      setParkingLogs(newLogs);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.Items || []);
      setSlotsList(Array.isArray(slotsData) ? slotsData : []);
      setBookingsList(newBookings);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);

    const timer = setInterval(() => {
      fetchData(true);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    navigate("/");
  };

  // Function to add a new entry to the logs
  const addParkingLog = async (numberPlate, isEntry, notes) => {
    try {
      await addLog({ numberPlate, action: isEntry ? "Entry" : "Exit", notes });
      await fetchData(true);
    } catch (err) {
      // Optimistic local update if API fails
      const logEntry = {
        vehicleId: numberPlate,
        numberPlate,
        action: isEntry ? "Entry" : "Exit",
        notes,
        timestamp: new Date().toISOString(),
      };
      setParkingLogs((prevLogs) => [logEntry, ...prevLogs]);
      console.warn("addLog API failed, updated locally:", err.message);
    }
  };

  const getCurrentlyParked = () => {
    const latestLogs = {};
    parkingLogs.forEach(log => {
      const plate = log.numberPlate;
      if (plate && !latestLogs[plate]) {
        latestLogs[plate] = log;
      }
    });
    return Object.values(latestLogs).filter(log => log.action === 'Entry');
  };

  const handleSlotClick = async (slot) => {
    if (slot.status !== 'AVAILABLE' && slot.status !== 'MAINTENANCE') {
      toast.warn("Only available or maintenance slots can be toggled.");
      return;
    }
    const nextStatus = slot.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await patchSlot(slot.id, { status: nextStatus });
      toast.success(`Slot ${slot.slotNumber} set to ${nextStatus.toLowerCase()} successfully.`);
      await fetchData(true);
    } catch (err) {
      toast.error(`Failed to update slot: ${err.message}`);
    }
  };

  return (
    <div className="security-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-50 flex justify-between items-center py-3 sm:py-4 px-4 sm:px-8 bg-white/90 border-b border-slate-200 backdrop-blur-md shadow-sm text-slate-800">
        <div className="logo flex items-center transition duration-300 hover:opacity-90">
          <img src={logo} alt="ParkWise Logo" className="h-8 sm:h-12 w-auto" />
        </div>
        <h2 className="text-lg sm:text-3xl font-extrabold text-indigo-600">
          Security Dashboard
        </h2>
        <div>
          <button
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all duration-300 text-xs sm:text-sm shadow-sm"
            onClick={handleClick}
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center mt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-lg font-semibold ml-4 text-slate-500">Loading Dashboard...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto py-8 px-6 space-y-10">
          


          {/* Quick Check-In (Pending Bookings) */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-indigo-650">
              Quick Check-In (Active Reservations)
            </h3>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {bookingsList.filter(b => b.status === 'BOOKED').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookingsList.filter(b => b.status === 'BOOKED').map((booking) => (
                    <div key={booking.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center shadow-sm transition duration-300 hover:border-indigo-400">
                      <div>
                        <div className="font-bold text-xl font-mono text-indigo-600 tracking-wider uppercase">{booking.vehicle?.numberPlate}</div>
                        <div className="text-xs text-slate-500 mt-1">Resident: {booking.user?.fullName || booking.user?.username}</div>
                        <div className="text-sm text-green-600 font-bold mt-1.5 flex items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-[0_0_6px_#22c55e]"></span>
                          Slot: {booking.slot?.slotNumber}
                        </div>
                      </div>
                      <button
                        onClick={() => addParkingLog(booking.vehicle?.numberPlate, true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm active:scale-95 transition duration-300 text-xs uppercase tracking-wider"
                      >
                        Check In
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No active reservations pending check-in.</p>
              )}
            </div>
          </section>

          {/* Quick Check-Out (Currently Parked Vehicles) */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-indigo-650">
              Quick Check-Out (Currently Parked)
            </h3>
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {getCurrentlyParked().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentlyParked().map((parked) => {
                    const activeSlot = slotsList.find(s => s.status === 'OCCUPIED' && s.bookings?.some(b => b.vehicle?.numberPlate === parked.numberPlate));
                    return (
                      <div key={parked.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center shadow-sm transition duration-300 hover:border-rose-400">
                        <div>
                          <div className="font-bold text-xl font-mono text-rose-600 tracking-wider uppercase">{parked.numberPlate}</div>
                          <div className="text-xs text-slate-500 mt-1">Entered: {new Date(parked.timestamp).toLocaleTimeString()}</div>
                          {activeSlot ? (
                            <div className="text-sm font-semibold text-rose-600 mt-1.5 flex items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_6px_#ef4444]"></span>
                              Slot: {activeSlot.slotNumber}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-slate-500 mt-1.5 flex items-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-2"></span>
                              General Parking
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => addParkingLog(parked.numberPlate, false)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm active:scale-95 transition duration-300 text-xs uppercase tracking-wider"
                        >
                          Check Out
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No vehicles currently parked in the lot.</p>
              )}
            </div>
          </section>

          {/* Parking Slots Map */}
          <section>
            <ParkingMap slotsList={slotsList} onSlotClick={handleSlotClick} />
          </section>

          {/* Entry/Exit Logs History */}
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-indigo-650">
              Entry/Exit History Logs
            </h3>
            <ul className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
              {parkingLogs.length > 0 ? (
                parkingLogs.map((log, index) => (
                  <li
                    key={log.id || index}
                    className="py-4 px-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex justify-between items-center transition duration-300 hover:border-slate-300"
                  >
                    <div>
                      <span className="font-mono font-bold text-lg text-slate-800 uppercase tracking-wider">{log.numberPlate}</span> - {log.action === "Entry" ? (
                        <span className="text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full text-xs ml-2">Entered</span>
                      ) : (
                        <span className="text-rose-600 font-semibold px-2 py-0.5 bg-rose-500/10 rounded-full text-xs ml-2">Exited</span>
                      )}
                      {log.notes && <span className="text-slate-500 text-sm block mt-1">Notes: {log.notes}</span>}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No log records found.</p>
              )}
            </ul>
          </section>
        </main>
      )}
      
      <ToastContainer theme="light" /> {/* Styled react-toastify alerts */}
    </div>
  );
};

export default SecurityDashboard;
