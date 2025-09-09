import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api/auth';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddFood from './pages/AddFood';
import EditFood from './pages/EditFood';

// Styles
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              authAPI.isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              authAPI.isAuthenticated() ? 
              <Navigate to="/dashboard" replace /> : 
              <Register />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-food" 
            element={
              <ProtectedRoute>
                <Navbar />
                <AddFood />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-food/:id" 
            element={
              <ProtectedRoute>
                <Navbar />
                <EditFood />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate to={authAPI.isAuthenticated() ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Navigate to={authAPI.isAuthenticated() ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
