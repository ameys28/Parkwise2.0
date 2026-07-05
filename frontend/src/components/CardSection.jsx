const CardsSection = () => {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-6xl px-8">
        {/* Card 1 */}
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center shadow-md hover:shadow-lg hover:border-indigo-450 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Interactive Floor Map</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Visualize L1/L2 floor plans in real-time. Spot indicators change color to reflect bookings and active vehicle check-ins.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center shadow-md hover:shadow-lg hover:border-indigo-450 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Quick Check-In/Out</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Log vehicle entries and exits manually with custom event notes or use one-click check-ins for booked residents.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center shadow-md hover:shadow-lg hover:border-indigo-450 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Role-Based Protection</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Strict navigation guards secure the dashboards so residents and security personnel only access authorized resources.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CardsSection;
