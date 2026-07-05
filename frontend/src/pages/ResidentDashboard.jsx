// src/pages/ResidentDashboard.js

import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/logo1.png";
import { AuthContext } from "../context/AuthContext.jsx";
import { addVehicle, createBooking, getBookings, getLogs, getOccupancy, getSlots, getVehicles, cancelBooking, deleteVehicle } from "../services/api";
import ParkingMap from "../components/ParkingMap";

const ResidentDashboard = () => {
  const [vehiclesList, setVehiclesList] = useState([]);
  const [parkingLogsList, setParkingLogsList] = useState([]);
  const [occupancy, setOccupancy] = useState(0);
  const [totalSpots, setTotalSpots] = useState(20);
  const [slotsList, setSlotsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [newVehicleNumber, setNewVehicleNumber] = useState("");
  const [guestVehicleNumber, setGuestVehicleNumber] = useState("");
  const [bookingVehicleNumber, setBookingVehicleNumber] = useState("");
  const [bookingSlotNumber, setBookingSlotNumber] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const ownerId = auth?.user?.id;
      const [vehiclesData, logsData, occupancyData] = await Promise.all([
        getVehicles(ownerId),
        getLogs(),
        getOccupancy(),
      ]);
      const [slotsData, bookingsData] = await Promise.all([
        getSlots(),
        getBookings({ ownerId }),
      ]);
      
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.Items || []);
      setParkingLogsList(Array.isArray(logsData) ? logsData : logsData?.Items || []);
      setOccupancy(occupancyData?.occupancy ?? 0);
      setTotalSpots(occupancyData?.totalSpots ?? 20);
      setSlotsList(Array.isArray(slotsData) ? slotsData : []);
      setBookingsList(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [auth?.user?.id]);

  useEffect(() => {
    fetchData(false);

    const timer = setInterval(() => {
      fetchData(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [fetchData]);

  const handleRegisterVehicle = async () => {
    if (!newVehicleNumber) {
      toast.error("Please enter a vehicle number.");
      return;
    }
    try {
      await addVehicle({
        numberPlate: newVehicleNumber,
        ownerId: auth?.user?.id || null,
        guest: false,
      });
      toast.success("Vehicle registered successfully.");
      setNewVehicleNumber("");
      await fetchData(true);
    } catch (err) {
      toast.error(err.message || "Failed to register vehicle.");
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteVehicle(vehicleId);
      toast.success("Vehicle removed successfully.");
      await fetchData(true);
    } catch (err) {
      toast.error(err.message || "Failed to remove vehicle.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      toast.success("Reservation cancelled successfully.");
      await fetchData(true);
    } catch (err) {
      toast.error(err.message || "Failed to cancel reservation.");
    }
  };

  const handleReserveSpot = async () => {
    if (!bookingSlotNumber) {
      toast.error("Please select a parking slot.");
      return;
    }

    if (isGuest) {
      if (!guestVehicleNumber) {
        toast.error("Please enter guest vehicle number.");
        return;
      }
      try {
        const guestVehicle = await addVehicle({
          numberPlate: guestVehicleNumber,
          ownerId: null,
          guest: true,
        });
        await createBooking({
          userId: auth?.user?.id,
          slotId: bookingSlotNumber,
          vehicleId: guestVehicle.id,
        });
        const chosenSlot = slotsList.find(s => s.id === bookingSlotNumber);
        toast.success(`Guest spot reserved! Slot: ${chosenSlot?.slotNumber || 'P'}`);
        setGuestVehicleNumber("");
        setBookingSlotNumber("");
        await fetchData(true);
      } catch (err) {
        toast.error(err.message || "Failed to reserve guest parking.");
      }
    } else {
      if (!bookingVehicleNumber) {
        toast.error("Please select a registered vehicle.");
        return;
      }
      try {
        await createBooking({
          userId: auth?.user?.id,
          slotId: bookingSlotNumber,
          vehicleId: bookingVehicleNumber,
        });
        toast.success("Parking spot reserved successfully!");
        setBookingVehicleNumber("");
        setBookingSlotNumber("");
        await fetchData(true);
      } catch (err) {
        toast.error(err.message || "Failed to create booking.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getOccupancyRate = () => {
    if (totalSpots === 0) return 0;
    return Math.round((occupancy / totalSpots) * 100);
  };

  return (
    <div className="resident-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-zinc-100 to-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-50 flex justify-between items-center py-3 sm:py-4 px-4 sm:px-8 bg-white/90 border-b border-slate-200 backdrop-blur-md shadow-sm text-slate-800">
        <div className="logo flex items-center transition duration-300 hover:opacity-90">
          <img src={logo} alt="ParkWise Logo" className="h-8 sm:h-12 w-auto" />
        </div>
        <h2 className="text-lg sm:text-3xl font-extrabold text-indigo-655">
          Resident Portal
        </h2>
        <div>
          <button
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all duration-300 text-xs sm:text-sm shadow-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center mt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-lg font-semibold ml-4 text-slate-500">Loading Portal...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto py-8 px-6 space-y-10">
          
          {/* Welcome and Occupancy Meter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 p-8 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center">
              <h1 className="text-4xl font-extrabold mb-3">
                Welcome, <span className="text-indigo-650 font-black">{auth?.user?.fullName || auth?.user?.username}</span>!
              </h1>
              <p className="text-slate-500 leading-relaxed max-w-xl text-sm sm:text-base">
                Manage your vehicles, reserve parking spots, and inspect current parking occupancy states.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm text-center flex flex-col justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parking Occupancy</h3>
              <div className="my-4">
                <div className="text-5xl font-black text-indigo-600">
                  {occupancy} / {totalSpots}
                </div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Spots Occupied</div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                <div 
                  className="bg-indigo-650 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${getOccupancyRate()}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-bold">{getOccupancyRate()}% Capacity Fill</div>
            </div>
          </div>

          {/* Action panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicle Registration */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-600 mb-2">Register Vehicle</h3>
                <p className="text-xs text-slate-500">Add a personal vehicle plate to your resident profile account.</p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="E.G. MH12AB1234"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase text-slate-800 shadow-sm"
                />
                <button
                  onClick={handleRegisterVehicle}
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm active:scale-95"
                >
                  Register
                </button>
              </div>
            </div>

            {/* Combined Booking Form */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-600 mb-2">Reserve Parking Spot</h3>
                <p className="text-xs text-slate-500">Book an available slot for a resident vehicle or guest vehicle.</p>
              </div>
              
              <div className="space-y-4">
                {/* Vehicle Type Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200 space-x-1">
                  <button
                    onClick={() => setIsGuest(false)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase transition ${
                      !isGuest ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Personal Vehicle
                  </button>
                  <button
                    onClick={() => setIsGuest(true)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase transition ${
                      isGuest ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Guest Vehicle
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Vehicle field */}
                  {isGuest ? (
                    <input
                      type="text"
                      placeholder="Guest Plate (E.G. MH12CD5678)"
                      value={guestVehicleNumber}
                      onChange={(e) => setGuestVehicleNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase text-slate-800 shadow-sm"
                    />
                  ) : (
                    <select
                      value={bookingVehicleNumber}
                      onChange={(e) => setBookingVehicleNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-mono"
                    >
                      <option value="">Select Registered Vehicle</option>
                      {vehiclesList.filter(v => !v.guest).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.numberPlate}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Select Slot dropdown */}
                  <select
                    value={bookingSlotNumber}
                    onChange={(e) => setBookingSlotNumber(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="">Select Available Slot</option>
                    {slotsList.filter(s => s.status === 'AVAILABLE').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.slotNumber} (Level {s.level || 'L1'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleReserveSpot}
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm active:scale-95"
                >
                  Reserve Parking Slot
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <section>
            <ParkingMap slotsList={slotsList} />
          </section>

          {/* Lists side-by-side (Vehicles, Bookings) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registered Vehicles */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[350px]">
              <h3 className="text-xl font-bold text-indigo-650 mb-4 border-b border-slate-100 pb-2">Registered Vehicles</h3>
              <ul className="space-y-3 overflow-y-auto flex-grow scrollbar-thin">
                {vehiclesList.length > 0 ? (
                  vehiclesList.map((vehicle) => (
                    <li key={vehicle.id} className="py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center transition duration-300 hover:border-slate-300">
                      <div>
                        <span className="font-mono font-bold text-slate-800 tracking-wider uppercase">{vehicle.numberPlate}</span>
                        {vehicle.guest ? (
                          <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full uppercase">Guest</span>
                        ) : (
                          <span className="ml-2 text-[10px] bg-indigo-500/10 text-indigo-600 font-bold px-2 py-0.5 rounded-full uppercase">Resident</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-xs text-rose-600 hover:text-white font-bold bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 active:scale-95 transition"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No vehicles registered.</p>
                )}
              </ul>
            </div>

            {/* Booking History */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-[350px]">
              <h3 className="text-xl font-bold text-indigo-650 mb-4 border-b border-slate-100 pb-2">Booking History</h3>
              <ul className="space-y-3 overflow-y-auto flex-grow scrollbar-thin">
                {bookingsList.length > 0 ? (
                  bookingsList.map((booking) => (
                    <li key={booking.id} className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center transition duration-300 hover:border-slate-300">
                      <div>
                        <div className="font-semibold text-sm">
                          Slot <span className="text-indigo-650">{booking.slot?.slotNumber || booking.slotId}</span> - <span className="font-mono uppercase font-bold text-slate-700">{booking.vehicle?.numberPlate}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Status: <span className={`uppercase font-bold ${
                            booking.status === 'BOOKED' ? 'text-indigo-650' : booking.status === 'COMPLETED' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>{booking.status}</span>
                        </div>
                      </div>
                      {booking.status === 'BOOKED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-xs text-rose-600 hover:text-white font-bold bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 active:scale-95 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No bookings created.</p>
                )}
              </ul>
            </div>
          </div>
        </main>
      )}
      
      <ToastContainer theme="light" />
    </div>
  );
};

export default ResidentDashboard;
