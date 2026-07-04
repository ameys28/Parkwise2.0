import './App.css'
import ResidentDashboard from './pages/ResidentDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import LandingPage from './pages/LandingPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/resident-dashboard" element={<ResidentDashboard />} />
        <Route path="/security-dashboard" element={<SecurityDashboard />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
