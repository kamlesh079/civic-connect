import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { RoleRoute } from './components/routes/RoleRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/auth/Unauthorized';
import { CitizenDashboard } from './pages/citizen/Dashboard';
import { CitizenIssueList } from './pages/citizen/IssueList';
import { CitizenIssueDetails } from './pages/citizen/IssueDetails';
import { ReportIssue } from './pages/citizen/ReportIssue';

// Placeholder Pages for future phases
const PlaceholderPage = ({ title }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-gray-600">This module will be implemented in the upcoming phases.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            
          {/* Citizen Routes */}
          <Route element={<RoleRoute allowedRoles={['Citizen', 'Admin']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/issues" element={<CitizenIssueList />} />
            <Route path="/citizen/issues/:id" element={<CitizenIssueDetails />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
          </Route>
          
          {/* Add a redirect for the old generic dashboard route for backwards compatibility with Login.jsx */}
          <Route path="/dashboard" element={<Navigate to="/citizen/dashboard" replace />} />

            {/* Officer Routes */}
            <Route element={<RoleRoute allowedRoles={['Officer']} />}>
              <Route path="/officer/dashboard" element={<PlaceholderPage title="Officer Dashboard" />} />
              <Route path="/officer/issues" element={<PlaceholderPage title="Assigned Issues" />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['Admin']} />}>
              <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Analytics Dashboard" />} />
              <Route path="/admin/users" element={<PlaceholderPage title="User Management" />} />
              <Route path="/admin/issues" element={<PlaceholderPage title="Global Issue Queue" />} />
              <Route path="/admin/categories" element={<PlaceholderPage title="Manage Categories" />} />
            </Route>

          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;