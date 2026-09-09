import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Filter, Eye } from 'lucide-react';

export const OfficerIssueList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await officerService.getAssignedIssues({ search: searchTerm, status: statusFilter });
        setIssues(res.data);
      } catch (error) {
        console.error('Failed to fetch assigned issues:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce for search
    const delayDebounce = setTimeout(() => {
      fetchIssues();
    }, 300);
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Assigned Work Queue</h1>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Assigned">Assigned (New)</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : issues.length === 0 ? (
          <EmptyState title="No assignments found" message="You have no issues matching this criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Issue Title</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {issues.map(issue => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">{issue.title}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{issue.address}</td>
                    <td className="px-6 py-4"><StatusBadge status={issue.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={issue.priority} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/officer/issues/${issue._id}`} className="text-blue-600 hover:text-blue-800 flex justify-end items-center">
                        <Eye size={18} className="mr-1" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};