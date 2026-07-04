import car from "../assets/carimg.png"


const HeroSection = () => {
  return (
    <section className=" bg-[#F5F9D0] flex flex-row items-center justify-center text-center">
      <div>
      <h1 className="text-5xl font-bold text-green-700">The Best Way to Park !!</h1>
      <p className="text-2xl font-semibold text-green-600 mt-4">
        ParkWise - Effortless Parking, Anytime, Anywhere
      </p>
      <button className="mt-10 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-red-600">
        Getting Started
      </button>
      </div>
      

      {/* Illustration */}
      <div className="mt-10">
        <img src={car} alt="Person with Car" className="w-[55rem] h-[35rem]" />
      </div>
    </section>
  );
};

export default HeroSection;
