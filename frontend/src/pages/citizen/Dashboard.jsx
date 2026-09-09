import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { issueService } from '../../services/issueService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { EmptyState } from '../../components/ui/EmptyState';
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

export const CitizenDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch 5 recent issues
        const recentRes = await issueService.getMyIssues({ limit: 5 });
        setRecentIssues(recentRes.data);

        // Fetch counts for specific statuses using limit=1 to minimize payload
        const [pendingRes, progressRes, resolvedRes] = await Promise.all([
          issueService.getMyIssues({ status: 'Submitted', limit: 1 }),
          issueService.getMyIssues({ status: 'In Progress', limit: 1 }),
          issueService.getMyIssues({ status: 'Resolved', limit: 1 })
        ]);

        setStats({
          total: recentRes.pagination.total,
          pending: pendingRes.pagination.total,
          inProgress: progressRes.pagination.total,
          resolved: resolvedRes.pagination.total
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/citizen/report"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          Report Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Submitted" value={stats.total} icon={FileText} colorClass="bg-blue-100 text-blue-600" loading={loading} />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} colorClass="bg-purple-100 text-purple-600" loading={loading} />
        <StatCard title="In Progress" value={stats.inProgress} icon={AlertCircle} colorClass="bg-yellow-100 text-yellow-600" loading={loading} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} colorClass="bg-green-100 text-green-600" loading={loading} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Complaints</h2>
          <Link to="/citizen/issues" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            <CardSkeleton />
          </div>
        ) : recentIssues.length === 0 ? (
          <EmptyState 
            title="No issues reported yet" 
            message="You haven't submitted any civic issues. Click 'Report Issue' to get started." 
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {recentIssues.map(issue => (
              <div key={issue._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/citizen/issues/${issue._id}`} className="text-lg font-medium text-blue-600 hover:underline">
                    {issue.title}
                  </Link>
                  <StatusBadge status={issue.status} />
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <span>Reported on: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span><PriorityBadge priority={issue.priority} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};