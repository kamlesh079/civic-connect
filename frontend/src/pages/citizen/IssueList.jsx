import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../../services/issueService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export const CitizenIssueList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await issueService.getMyIssues({ page, limit: 10 });
        setIssues(res.data);
        setPagination(res.pagination);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Submitted Issues</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : issues.length === 0 ? (
          <EmptyState title="No issues found" message="You have not submitted any issues." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {issues.map(issue => (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">{issue.title}</td>
                      <td className="px-6 py-4">{issue.category?.name || 'N/A'}</td>
                      <td className="px-6 py-4"><StatusBadge status={issue.status} /></td>
                      <td className="px-6 py-4"><PriorityBadge priority={issue.priority} /></td>
                      <td className="px-6 py-4">{new Date(issue.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/citizen/issues/${issue._id}`} className="text-blue-600 hover:text-blue-800 flex justify-end items-center">
                          <Eye size={18} className="mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.pages}</span>
                </span>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1 rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1 rounded-md border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};