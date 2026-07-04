const CardsSection = () => {
  return (
    <section className="py-16 bg-yellow-100">
      <div className="grid grid-cols-3 gap-8 mx-auto max-w-5xl">
        {/* Card 1 */}
        <div className="bg-green-200 p-6 rounded-lg text-center shadow-lg">
          <h3 className="text-xl font-bold text-pink-500">Lorem</h3>
        </div>
        {/* Card 2 */}
        <div className="bg-green-200 p-6 rounded-lg text-center shadow-lg">
          <h3 className="text-xl font-bold text-pink-500">Lorem</h3>
        </div>
        {/* Card 3 */}
        <div className="bg-green-200 p-6 rounded-lg text-center shadow-lg">
          <h3 className="text-xl font-bold text-pink-500">Lorem</h3>
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
