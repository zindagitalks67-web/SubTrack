import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // 👈 Ye line add karo

import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { BillsProvider } from './context/BillsContext';
import { FinanceProvider } from './context/FinanceContext';
import { BudgetProvider } from './context/BudgetContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <BillsProvider>
          <FinanceProvider>
            <BudgetProvider>
              <App />
            </BudgetProvider>
          </FinanceProvider>
        </BillsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </StrictMode>
);