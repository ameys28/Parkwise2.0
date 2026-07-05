import logo from "../assets/logo1.png"

const Header = ({ openResidentLogin, openSecurityLogin }) => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center py-3 sm:py-4 px-4 sm:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm text-slate-800">
      <div className="logo flex items-center transition duration-300 hover:opacity-95">
        <img src={logo} alt="ParkWise Logo" className="h-8 sm:h-12 w-auto" />
      </div>
      <nav className="hidden md:block">
        <ul className="flex space-x-8">
          <li className="text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition duration-300 uppercase tracking-wider">Home</li>
          <li className="text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition duration-300 uppercase tracking-wider">About Us</li>
          <li className="text-sm font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition duration-300 uppercase tracking-wider">My Account</li>
        </ul>
      </nav>
      {/* Two separate buttons for Resident and Security login */}
      <div className="space-x-2 sm:space-x-4">
        {/* Resident Login Button */}
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-md shadow-indigo-600/10 active:scale-95 transition-all duration-300 text-xs sm:text-sm"
          onClick={openResidentLogin}
        >
          Resident Portal
        </button>

        {/* Security Login Button */}
        <button
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all duration-300 text-xs sm:text-sm shadow-sm"
          onClick={openSecurityLogin}
        >
          Security Desk
        </button>
      </div>
    </header>
  );
};

export default Header;
