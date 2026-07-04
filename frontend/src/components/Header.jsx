import logo from "../assets/logo1.png"

const Header = ({ openResidentLogin, openSecurityLogin }) => {
  return (
    <header className="flex justify-between items-center py-2 px-8 bg-[#ff9fa0] shadow-md">
      <div className="logo flex items-center">
        <img src={logo} alt="ParkWise Logo" className="h-20 w-30" />
      </div>
      <nav>
        <ul className="flex space-x-8">
          <li className="text-lg font-semibold hover:text-green-700">Home</li>
          <li className="text-lg font-semibold hover:text-green-700">About Us</li>
          <li className="text-lg font-semibold hover:text-green-700">My Account</li>
        </ul>
      </nav>
      {/* Two separate buttons for Resident and Security login */}
      <div className="space-x-4">
        {/* Resident Login Button */}
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
          onClick={openResidentLogin}
        >
          Resident Login
        </button>

        {/* Security Login Button */}
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600"
          onClick={openSecurityLogin}
        >
          Security Login
        </button>
      </div>
    </header>
  );
};

export default Header;
