// src/pages/ResidentDashboard.js

import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/logo1.png";
import { AuthContext } from "../context/AuthContext.jsx";
import { addVehicle, createBooking, getBookings, getLogs, getOccupancy, getSlots, getVehicles } from "../services/api";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const fetchData = useCallback(async () => {
    setLoading(true);
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
      // Ensure data is always in expected format
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.Items || []);
      setParkingLogsList(Array.isArray(logsData) ? logsData : logsData?.Items || []);
      setOccupancy(occupancyData?.occupancy ?? 0);
      setTotalSpots(occupancyData?.totalSpots ?? 20);
      setSlotsList(Array.isArray(slotsData) ? slotsData : []);
      setBookingsList(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setVehiclesList([]);
      setParkingLogsList([]);
      setSlotsList([]);
      setBookingsList([]);
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.id]);

  useEffect(() => {
    fetchData();
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
      setNewVehicleNumber("");
      toast.success("Vehicle registered successfully!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to register vehicle: " + err.message);
    }
  };

  const handleClick = async () => {
    await logout();
    navigate("/");
    toast.info("Logged out successfully!");
  };

  const handleReserveGuestParking = async () => {
    if (!guestVehicleNumber) {
      toast.error("Please enter a guest vehicle number.");
      return;
    }
    try {
      await addVehicle({
        numberPlate: guestVehicleNumber,
        ownerId: auth?.user?.id || null,
        guest: true,
      });
      setGuestVehicleNumber("");
      toast.success("Guest parking reserved successfully!");
      await fetchData();
    } catch (err) {
      toast.error("Failed to reserve guest parking: " + err.message);
    }
  };

  const handleCreateBooking = async () => {
    const normalizedVehicle = bookingVehicleNumber.trim().toUpperCase();
    if (!normalizedVehicle || !bookingSlotNumber) {
      toast.error("Please enter a vehicle number and select an available slot.");
      return;
    }

    const vehicle = vehiclesList.find(
      (item) => item.numberPlate?.toUpperCase() === normalizedVehicle
    );
    const normalizedSlotNumber = bookingSlotNumber.trim().toUpperCase();
    const slot = slotsList.find((item) => item.slotNumber?.toUpperCase() === normalizedSlotNumber);

    if (!vehicle) {
      toast.error("Register the vehicle before booking a slot.");
      return;
    }

    if (!slot) {
      toast.error("Selected slot does not exist.");
      return;
    }

    if (slot.status !== 'AVAILABLE') {
      toast.error("Selected slot is not available.");
      return;
    }

    try {
      await createBooking({ vehicleId: vehicle.id, slotNumber: slot.slotNumber });
      setBookingVehicleNumber("");
      setBookingSlotNumber("");
      toast.success(`Slot ${slot.slotNumber} booked successfully!`);
      await fetchData();
    } catch (err) {
      toast.error("Failed to create booking: " + err.message);
    }
  };

  return (
    <div className="resident-dashboard min-h-screen" style={{ backgroundColor: "#F5F9D0", fontFamily: "'Kalnia', sans-serif" }}>
  <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

  {/* Navbar */}
  <header className="flex justify-between items-center py-3 px-8" style={{ backgroundColor: "#FF9FA0" }}>
    <div className="logo flex items-center">
      <img src={logo} alt="ParkWise Logo" className="h-16 w-auto" />
    </div>
    <h2 className="text-4xl font-bold" style={{ color: "#3B3B3B" }}>
      Resident Dashboard
    </h2>
    <button
      className="bg-[#E44A4A] text-white px-5 py-2 rounded-full shadow transition duration-300"
      onClick={handleClick}
      style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: "bold" }}
    >
      Logout
    </button>
  </header>

  {loading ? (
    <div className="flex justify-center items-center mt-20">
      <p className="text-xl font-semibold" style={{ color: "#3B3B3B" }}>Loading...</p>
    </div>
  ) : (
    <>
  {/* Main Content */}
  <div className="grid grid-cols-2 gap-8 px-8 mt-10">
    {/* Resident Reservation Section */}
    <section
      className="p-8 rounded-lg shadow-md border border-black"
      style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B", fontFamily: "'Orbitron', sans-serif" }}
    >
      <h3 className="text-2xl font-bold mb-4 text-center">
        Resident Reservation
      </h3>
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Enter Vehicle Number"
          value={newVehicleNumber}
          onChange={(e) => setNewVehicleNumber(e.target.value)}
          className="p-2 w-full rounded-l-full border border-black"
          style={{ backgroundColor: "#ECECEC", color: "#3B3B3B" }}
        />
        <button
          className="bg-[#E44A4A] text-white ml-6 px-4 py-1 rounded-r-full shadow transition text-sm font-semibold"
          onClick={handleRegisterVehicle}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          SAVE
        </button>
      </div>
    </section>

    {/* Guest Reservation Section */}
    <section
      className="p-8 rounded-lg shadow-md border border-black"
      style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B", fontFamily: "'Orbitron', sans-serif" }}
    >
      <h3 className="text-2xl font-bold mb-4 text-center">
        Guest Reservation
      </h3>
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Enter Guest Vehicle Number"
          value={guestVehicleNumber}
          onChange={(e) => setGuestVehicleNumber(e.target.value)}
          className="p-2 w-full rounded-l-full border border-black"
          style={{ backgroundColor: "#ECECEC", color: "#3B3B3B" }}
        />
        <button
          className="bg-[#E44A4A] text-white ml-6 px-4 py-1 rounded-r-full shadow transition text-sm font-semibold"
          onClick={handleReserveGuestParking}
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          SAVE
        </button>
      </div>
    </section>
  </div>

  {/* Occupancy Section */}
  <section className="px-8 mt-10">
    <div
      className="p-6 rounded-lg shadow-md text-center border border-black"
      style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B" }}
    >
      <h3 className="text-2xl font-semibold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        OCCUPANCY
      </h3>
      <p className="text-md font-semibold mt-2">
        Total Spots = {totalSpots} <br />
        Current Occupancy: {occupancy} spot(s) filled
      </p>
    </div>
  </section>

  <section className="px-8 mt-10 grid grid-cols-2 gap-8">
    <div className="p-6 rounded-lg shadow-md border border-black" style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B" }}>
      <h3 className="text-2xl font-semibold mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Book a Slot
      </h3>
      <input
        type="text"
        placeholder="Vehicle Number"
        value={bookingVehicleNumber}
        onChange={(e) => setBookingVehicleNumber(e.target.value)}
        className="w-full p-3 rounded-lg border border-black mb-3"
      />
      <select
        value={bookingSlotNumber}
        onChange={(e) => setBookingSlotNumber(e.target.value)}
        className="w-full p-3 rounded-lg border border-black mb-3"
      >
        <option value="">Select an available slot</option>
        {slotsList.length === 0 ? (
          <option value="" disabled>No slots found in the database</option>
        ) : (
          slotsList.map((slot) => (
            <option
              key={slot.id}
              value={slot.slotNumber}
              disabled={slot.status !== 'AVAILABLE'}
            >
              {slot.slotNumber} {slot.level ? `(${slot.level})` : ''} - {slot.status}
            </option>
          ))
        )}
      </select>
      <button
        className="w-full bg-[#E44A4A] text-white py-3 rounded-lg shadow transition duration-300"
        onClick={handleCreateBooking}
        disabled={!slotsList.some((slot) => slot.status === 'AVAILABLE')}
      >
        Reserve Slot
      </button>
    </div>

    <div className="p-6 rounded-lg shadow-md border border-black" style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B" }}>
      <h3 className="text-2xl font-semibold mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Booking History
      </h3>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {bookingsList.length > 0 ? bookingsList.map((booking) => (
          <li key={booking.id} className="p-3 rounded-lg border border-[#FF9FA0] bg-white">
            Slot {booking.slot?.slotNumber || booking.slotId} - {booking.status}
          </li>
        )) : <li className="text-center">No bookings yet.</li>}
      </ul>
    </div>
  </section>

  <section className="px-8 mt-10">
    <div className="p-6 rounded-lg shadow-md border border-black" style={{ backgroundColor: "#F9DFD8", color: "#3B3B3B" }}>
      <h3 className="text-2xl font-semibold mb-4 text-center" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Parking Slots
      </h3>
      <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto">
        {slotsList.map((slot) => (
          <div key={slot.id} className="p-3 rounded-lg border border-black text-center bg-white">
            <div className="font-bold">{slot.slotNumber}</div>
            <div className="text-sm">{slot.status}</div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* Logs and Registered Vehicles */}
  <div className="grid grid-cols-2 gap-8 px-8 mt-10">
    {/* Parking Logs */}
    <section
      className="p-6 rounded-r-3xl shadow-lg border border-black max-h-fit"
      style={{
        backgroundColor: "#F9DFD8",
        color: "#3B3B3B",
        fontFamily: "'Orbitron', sans-serif",
        boxShadow: "8px 8px 0px #D1A3A4",
      }}
    >
      <h3 className="text-lg font-semibold mb-4 text-center">
        Parking Logs
      </h3>
      <ul className="overflow-y-auto" style={{ maxHeight: "200px" }}>
        {parkingLogsList.map((log, index) => {
          const vehicleNumber = log.numberPlate || "Unknown";
          const entryTime = new Date(log.timestamp);
          const formattedEntryTime = entryTime.toString() !== "Invalid Date" ? entryTime.toLocaleString() : log.timestamp;

          return (
            <li
              key={log.logId || log.id || index}
              className="py-3 px-4 rounded-lg border border-[#FF9FA0] transition hover:bg-[#FFDADA] mb-2"
              style={{ color: "#3B3B3B" }}
            >
              Vehicle {vehicleNumber} - {log.action === "Exit" ? "Exited" : "Entered"} at {formattedEntryTime}
            </li>
          );
        })}
      </ul>
    </section>

    {/* Registered Vehicles */}
    <section
      className="p-6 rounded-l-3xl shadow-lg border border-black max-h-fit"
      style={{
        backgroundColor: "#F9DFD8",
        color: "#3B3B3B",
        fontFamily: "'Orbitron', sans-serif",
        boxShadow: "8px 8px 0px #D1A3A4",
      }}
    >
      <h3 className="text-lg font-semibold mb-4 text-center">
        Registered Vehicles
      </h3>
      <ul className="overflow-y-auto" style={{ maxHeight: "200px" }}>
        {vehiclesList.map((vehicle, index) => (
          <li
            key={vehicle.vehicleId || vehicle.id || index}
            className="py-3 px-4 rounded-lg border border-[#FF9FA0] transition hover:bg-[#FFDADA] mb-2"
            style={{ color: "#3B3B3B" }}
          >
            {vehicle.numberPlate} {vehicle.guest ? "(Guest)" : ""}
          </li>
        ))}
      </ul>
    </section>
  </div>
    </>
  )}
</div>

  );
};

export default ResidentDashboard;

