// src/pages/SecurityDashboard.js

import { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import NumberPlateRecognition from "./NumberPlateRecognition";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import { addLog, getBookings, getLogs, getSlots, getVehicles } from "../services/api";

const SecurityDashboard = () => {
  const [parkingLogs, setParkingLogs] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [slotsList, setSlotsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, vehiclesData] = await Promise.all([
        getLogs(),
        getVehicles(),
      ]);
      const [slotsData, bookingsData] = await Promise.all([
        getSlots(),
        getBookings(),
      ]);
      // Ensure data is always in expected format
      setParkingLogs(Array.isArray(logsData) ? logsData : logsData?.Items || []);
      setVehiclesList(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.Items || []);
      setSlotsList(Array.isArray(slotsData) ? slotsData : []);
      setBookingsList(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setParkingLogs([]);
      setVehiclesList([]);
      setSlotsList([]);
      setBookingsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = () => {
    navigate("/");
  };

  // Function to add a new entry to the logs
  const addParkingLog = async (numberPlate, isEntry) => {
    try {
      await addLog({ numberPlate, action: isEntry ? "Entry" : "Exit" });
      await fetchData();
    } catch (err) {
      // Optimistic local update if API fails
      const logEntry = {
        vehicleId: numberPlate,
        numberPlate,
        action: isEntry ? "Entry" : "Exit",
        timestamp: new Date().toISOString(),
      };
      setParkingLogs((prevLogs) => [logEntry, ...prevLogs]);
      console.warn("addLog API failed, updated locally:", err.message);
    }
  };

  const handleManualOverride = () => {
    const vehicle = vehiclesList.find(
      (v) => v.numberPlate.toLowerCase() === vehicleId.toLowerCase()
    );
    if (vehicle) {
      toast.success(`Manual override successful for vehicle: ${vehicle.numberPlate}`);
      addParkingLog(vehicle.numberPlate, true);
      setVehicleId("");
    } else {
      toast.error("Vehicle not found for override.");
    }
  };

  const handleSearchVehicle = () => {
    const vehicle = vehiclesList.find(
      (v) => v.numberPlate.toLowerCase() === vehicleId.toLowerCase()
    );
    if (vehicle) {
      const logs = parkingLogs.filter(
        (log) => log.numberPlate === vehicle.numberPlate
      );
      const message = `Vehicle ${vehicle.numberPlate} has ${
        logs.length > 0
          ? logs[0].action === "Entry"
            ? "entered"
            : "exited"
          : "no records"
      } recently.`;
      toast.success(message);
    } else {
      toast.error("Vehicle not found.");
    }
    setVehicleId(""); // Clear the input after search
  };

  return (
    <div className="security-dashboard min-h-screen bg-[#F5F9D0]">
      <header className="flex justify-between items-center py-2 px-8 bg-[#ff9fa0] shadow-md mb-8">
        <div className="logo flex items-center">
          <img src={logo} alt="ParkWise Logo" className="h-20 w-30" />
        </div>
        <h2 className="text-4xl font-bold text-center" style={{ color: "#4A6D0A" }}>
          Security Dashboard
        </h2>
        <div className="space-x-4">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300 shadow-md"
            onClick={handleClick}
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <p className="text-xl font-semibold text-[#799529]">Loading...</p>
        </div>
      ) : (
        <>
      {/* Vehicle Entry/Exit Query */}
      <section className="mb-10 px-8">
  <h3 className="text-2xl font-semibold mb-4 text-[#799529] flex items-center">
    <FaPlusCircle className="mr-2" />
    Vehicle Entry/Exit Query & Manual Override
  </h3>
  <input
    type="text"
    placeholder="Enter vehicle number"
    value={vehicleId}
    onChange={(e) => setVehicleId(e.target.value)}
    className="p-3 border border-[#92AB42] rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
    style={{ color: "#000000" }}
    aria-label="Vehicle Number"
  />
  <div className="space-x-4">
    <button
      className="py-3 px-6 rounded-lg bg-[#799529] text-white hover:bg-green-700 transition duration-300 shadow-md"
      onClick={handleSearchVehicle}
    >
      Search
    </button>
    <button
      className="py-3 px-6 rounded-lg bg-[#92AB42] text-white hover:bg-red-700 transition duration-300 shadow-md"
      onClick={handleManualOverride}
    >
      Override
    </button>
  </div>
</section>


      {/* Entry/Exit Logs */}
      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Entry/Exit Logs
        </h3>
        <ul className="p-6 rounded-lg shadow-lg space-y-4 bg-[#FFDFB0]">
          {parkingLogs.length > 0 ? (
            parkingLogs.map((log, index) => (
              <li
                key={index} // Use index if you don't have unique IDs
                className="py-3 px-4 rounded-lg border border-[#92AB42] bg-[#FEA0A0] text-black transition duration-300 hover:shadow-lg"
              >
                Vehicle {log.numberPlate} - {log.action} at {log.timestamp}
              </li>
            ))
          ) : (
            <li className="py-3 px-4 text-black">No logs available.</li>
          )}
        </ul>
      </section>

      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Parking Slots
        </h3>
        <div className="grid grid-cols-4 gap-3 p-6 rounded-lg shadow-lg bg-[#FFDFB0]">
          {slotsList.map((slot) => (
            <div key={slot.id} className="p-3 rounded-lg border border-[#92AB42] bg-white text-center">
              <div className="font-bold">{slot.slotNumber}</div>
              <div className="text-sm">{slot.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Booking History
        </h3>
        <ul className="p-6 rounded-lg shadow-lg space-y-4 bg-[#FFDFB0]">
          {bookingsList.length > 0 ? (
            bookingsList.map((booking) => (
              <li
                key={booking.id}
                className="py-3 px-4 rounded-lg border border-[#92AB42] bg-[#FEA0A0] text-black transition duration-300 hover:shadow-lg"
              >
                Slot {booking.slot?.slotNumber || booking.slotId} - {booking.status}
              </li>
            ))
          ) : (
            <li className="py-3 px-4 text-black">No bookings available.</li>
          )}
        </ul>
      </section>

      {/* Notifications 
      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Notifications
        </h3>
        <ul className="p-6 rounded-lg shadow-lg space-y-4 bg-[#FFDFB0]">
          {currentNotifications.map((note) => (
            <li
              key={note.id}
              className="py-3 px-4 rounded-lg border border-[#92AB42] bg-[#FEA0A0] text-black transition duration-300 hover:shadow-lg"
            >
              {note.message} at {new Date(note.time).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
*/}
      {/* Manual Override */}
      {/* <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529] flex items-center">
          <FaPlusCircle className="mr-2" />
          Manual Override
        </h3>
        <input
          type="text"
          placeholder="Enter vehicle number for override"
          value={overrideId}
          onChange={(e) => setOverrideId(e.target.value)}
          className="p-3 border border-[#92AB42] rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
          style={{ color: "#000000" }}
          aria-label="Vehicle Number for Override"
        />
        <button
          className="py-3 px-6 rounded-lg bg-[#92AB42] text-white hover:bg-red-700 transition duration-300 shadow-md"
          onClick={handleManualOverride}
        >
          Override
        </button>
      </section> */}

      {/* Add New Resident */}
      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Add New Resident
        </h3>
        <AddResidentForm />
      </section>

      {/* Entry/Exit */}
      <section className="mb-10 px-8">
        <h3 className="text-2xl font-semibold mb-4 text-[#799529]">
          Entry/Exit
        </h3>
        <NumberPlateRecognition addParkingLog={addParkingLog} />
      </section>
        </>
      )}
      
      <ToastContainer /> {/* Add ToastContainer for notifications */}
    </div>
  );
};

const AddResidentForm = () => {
  const [residentName, setResidentName] = useState("");
  const [residentEmail, setResidentEmail] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddResident = () => {
    if (!residentName || !vehicleNumber) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success(`Resident ${residentName} with vehicle ${vehicleNumber} added successfully.`);
    setResidentName("");
    setResidentEmail("");
    setVehicleNumber("");
    setSuccessMessage("Resident added successfully!");
  };

  return (
    <form className="p-6 rounded-lg shadow-lg space-y-4 bg-[#FFDFB0]">
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <input
        type="text"
        placeholder="Resident Name"
        value={residentName}
        onChange={(e) => setResidentName(e.target.value)}
        className="p-3 border border-[#92AB42] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
        style={{ color: "#000000" }}
        aria-label="Resident Name"
      />
      <input
        type="email"
        placeholder="Resident Email"
        value={residentEmail}
        onChange={(e) => setResidentEmail(e.target.value)}
        className="p-3 border border-[#92AB42] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
        style={{ color: "#000000" }}
        aria-label="Resident Email"
      />
      <input
        type="text"
        placeholder="Vehicle Number"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
        className="p-3 border border-[#92AB42] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow-md"
        style={{ color: "#000000" }}
        aria-label="Vehicle Number"
      />
      <button
        type="button"
        className="py-3 px-6 rounded-lg bg-[#92AB42] text-white hover:bg-green-700 transition duration-300 shadow-md"
        onClick={handleAddResident}
      >
        Add Resident
      </button>
    </form>
  );
};

export default SecurityDashboard;
