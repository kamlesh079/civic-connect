import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { officerService } from '../../services/officerService';
import { CardSkeleton } from '../../components/ui/Skeleton';

const StatCard = ({ title, value, icon: Icon, colorClass, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
    <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

export const OfficerDashboard = () => {
  const [stats, setStats] = useState({ totalAssigned: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await officerService.getDashboardStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load officer stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
        <Link to="/officer/issues" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View Assigned Issues &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assigned" value={stats.totalAssigned} icon={ClipboardList} colorClass="bg-blue-100 text-blue-600" loading={loading} />
        <StatCard title="Pending" value={stats.pending} icon={AlertCircle} colorClass="bg-orange-100 text-orange-600" loading={loading} />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} colorClass="bg-indigo-100 text-indigo-600" loading={loading} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} colorClass="bg-green-100 text-green-600" loading={loading} />
      </div>
    </div>
  );
};