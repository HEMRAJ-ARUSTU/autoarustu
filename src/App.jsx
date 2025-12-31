import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import Agent from './pages/Agent';
import Supplier from './pages/Supplier';
import Contact from './pages/Contact/Contact';
import ContactModal from './pages/Contact/ContactModal';
import Bill from './pages/Bill/Bill';
import Expense from './pages/Expense/Expense';
import ListTable from './pages/ListTable/ListTable';
import Party from './pages/Party/Party';
import Temp from './pages/Temp/Temp';
import Payment from './pages/Payment/Payment';
import PaymentReminder from './pages/PaymentReminder/PaymentReminder';
// import Table from './pages/Table';

// Component to check if user is already logged in (for login page)
const PublicRoute = ({ children }) => {
  const userData = localStorage.getItem('UserData');
  
  if (userData) {
    try {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData?.access_token) {
        // User is already logged in, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      // Invalid UserData, allow access to login
      localStorage.removeItem('UserData');
    }
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} /> 
          <Route path="agent" element={<Agent />} />
          <Route path="supplier" element={<Supplier />} />
          <Route path="contact" element={<Contact />} />
          <Route path="contact/add" element={<ContactModal />} />
          <Route path="bill" element={<Bill />} />
          <Route path="expense" element={<Expense />} />
          <Route path="party" element={<Party />} />
          <Route path="temp" element={<Temp />} />
          <Route path="payment" element={<Payment />} />
          <Route path="paymentreminder" element={<PaymentReminder />} />
          <Route path="listtable" element={<ListTable />} />
        </Route>
        {/* Catch all other routes and redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
