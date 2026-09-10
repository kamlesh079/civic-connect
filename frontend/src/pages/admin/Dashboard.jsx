import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import {Spinner} from '../../components/ui/Spinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, issuesRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getIssues({ limit: 5, sort: '-createdAt' })
        ]);
        setStats(statsRes.data);
        setRecentIssues(issuesRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} color="bg-blue-100 text-blue-800" />
        <StatCard title="Total Officers" value={stats?.totalOfficers || 0} color="bg-indigo-100 text-indigo-800" />
        <StatCard title="Total Issues" value={stats?.totalIssues || 0} color="bg-gray-100 text-gray-800" />
        <StatCard title="Pending Issues" value={stats?.pendingIssues || 0} color="bg-yellow-100 text-yellow-800" />
        <StatCard title="Resolved Issues" value={stats?.resolvedIssues || 0} color="bg-green-100 text-green-800" />
        <StatCard title="Critical Priority" value={stats?.criticalIssues || 0} color="bg-red-100 text-red-800" />
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Issues</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentIssues.map((issue) => (
              <tr key={issue._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{issue.title}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{issue.priority}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(issue.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`p-6 rounded-lg shadow-sm border ${color}`}>
    <h3 className="text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;