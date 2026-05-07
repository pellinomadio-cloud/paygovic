
import React from 'react';
import { useLocation } from 'react-router-dom';
import { PayGoLogo } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isWelcomeScreen = location.pathname === '/welcome';
  const isOnboarding = location.pathname === '/onboarding';
  const isDashboard = location.pathname === '/dashboard';
  const isBuyPayId = location.pathname === '/buy-pay-id';
  const isProfile = location.pathname === '/profile';
  const isTransfer = location.pathname === '/transfer';
  const isUpgrade = location.pathname === '/upgrade';
  const isEarn = location.pathname === '/earn';
  const isAirtime = location.pathname === '/buy-airtime';
  const isData = location.pathname === '/buy-data';
  const isTransactions = location.pathname === '/transactions';

  // Pages that use the "app frame" style (mostly dashboard and its tools)
  const isAppTool = isDashboard || isBuyPayId || isProfile || isTransfer || isUpgrade || isEarn || isAirtime || isData || isTransactions;

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col items-center justify-start py-8 px-4 relative transition-colors duration-300 dark:bg-gray-950">
      {/* App Content */}
      <div className={`w-full max-md:max-w-md max-w-md bg-white transition-colors duration-300 dark:bg-gray-900 ${!isAppTool ? 'md:shadow-sm md:rounded-3xl md:p-8' : ''} flex flex-col items-center`}>
        {!isWelcomeScreen && !isOnboarding && !isAppTool && (
          <div className="mb-12">
            <PayGoLogo />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Layout;
