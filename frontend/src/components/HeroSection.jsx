import car from "../assets/carimg.png"

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-slate-100 to-zinc-50 py-16 px-8 flex flex-col lg:flex-row items-center justify-center gap-12 min-h-[70vh] text-slate-800">
      <div className="max-w-xl text-center lg:text-left">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          The Best Way to <span className="text-indigo-600">Park</span>.
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mt-6 font-medium leading-relaxed">
          ParkWise - Effortless Parking Management, Real-Time Slot Occupancy, and Frictionless Resident Booking.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-300">
            Get Started
          </button>
          <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl active:scale-95 transition-all duration-300 shadow-sm">
            Learn More
          </button>
        </div>
      </div>

      {/* Illustration */}
      <div className="flex-shrink-0 max-w-full">
        <img src={car} alt="Sleek Parking Illustration" className="w-full max-w-2xl h-auto object-contain transition duration-500 hover:scale-105" />
      </div>
    </section>
  );
};

export default HeroSection;
