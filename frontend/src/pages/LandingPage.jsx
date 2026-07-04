// src/pages/LandingPage.js

import { useState } from 'react';
import ResidentLogin from './ResidentLogin';
import SecurityLogin from './SecurityLogin';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CardSection from '../components/CardSection';

const LandingPage = () => {
  // State to manage both modals
  const [isResidentLoginOpen, setIsResidentLoginOpen] = useState(false);
  const [isSecurityLoginOpen, setIsSecurityLoginOpen] = useState(false);

  // Handlers for opening/closing modals
  const openResidentLogin = () => setIsResidentLoginOpen(true);
  const closeResidentLogin = () => setIsResidentLoginOpen(false);

  const openSecurityLogin = () => setIsSecurityLoginOpen(true);
  const closeSecurityLogin = () => setIsSecurityLoginOpen(false);

  return (
    <div>
      {/* Pass modal handlers to Header */}
      <Header openResidentLogin={openResidentLogin} openSecurityLogin={openSecurityLogin} />

      {/* Content of the landing page */}
      <HeroSection />
      <CardSection />

      {/* Modals */}
      {/* Resident Login Modal */}
      <ResidentLogin isOpen={isResidentLoginOpen} onClose={closeResidentLogin} />

      {/* Security Login Modal */}
      <SecurityLogin isOpen={isSecurityLoginOpen} onClose={closeSecurityLogin} />
    </div>
  );
};

export default LandingPage;
