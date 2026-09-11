import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { RoleRoute } from "./components/routes/RoleRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Unauthorized } from "./pages/auth/Unauthorized";

import { CitizenDashboard } from "./pages/citizen/Dashboard";
import { CitizenIssueList } from "./pages/citizen/IssueList";
import { CitizenIssueDetails } from "./pages/citizen/IssueDetails";
import { ReportIssue } from "./pages/citizen/ReportIssue";

import { OfficerDashboard } from "./pages/officer/Dashboard";
import { OfficerIssueList } from "./pages/officer/IssueList";
import { OfficerIssueDetails } from "./pages/officer/IssueDetails";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminIssues from "./pages/admin/AdminIssues";
import AdminIssueDetails from "./pages/admin/AdminIssueDetails";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";

// Placeholder Pages for future phases
const PlaceholderPage = ({ title }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-gray-600">
      This module will be implemented in the upcoming phases.
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes Wrapper */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Citizen Routes */}
            <Route element={<RoleRoute allowedRoles={["Citizen", "Admin"]} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/issues" element={<CitizenIssueList />} />
              <Route
                path="/citizen/issues/:id"
                element={<CitizenIssueDetails />}
              />
              <Route path="/citizen/report" element={<ReportIssue />} />
            </Route>

            {/* Add a redirect for the old generic dashboard route for backwards compatibility with Login.jsx */}
            <Route
              path="/dashboard"
              element={<Navigate to="/citizen/dashboard" replace />}
            />

            {/* Officer Routes */}
            <Route element={<RoleRoute allowedRoles={["Officer", "Admin"]} />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/issues" element={<OfficerIssueList />} />
              <Route
                path="/officer/issues/:id"
                element={<OfficerIssueDetails />}
              />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/issues" element={<AdminIssues />} />
              <Route path="/admin/issues/:id" element={<AdminIssueDetails />} />
              <Route path="/admin/users" element={<AdminUsers defaultRole="" />}/>
              <Route path="/admin/officers" element={<AdminUsers defaultRole="Officer" />}/>
              <Route path="/admin/categories" element={<AdminCategories />} />
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
