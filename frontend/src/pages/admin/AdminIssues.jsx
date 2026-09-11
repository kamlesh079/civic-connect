import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Spinner";
import { IssueLocationMap } from "../../components/map/IssueLocationMap";
import { mapProvider } from "../../components/map/mapProvider";

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: "", priority: "" });

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await adminService.getIssues({ page, limit: 10, ...filters });
      setIssues(res.data);
      setTotalPages(res.pagination.pages);
    } catch (error) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await adminService.getUsers({ role: "Officer" });
      setOfficers(res.data);
    } catch (error) {
      toast.error("Failed to load officers for assignment");
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [page, filters]);

  const handleAssign = async (issueId, officerId) => {
    try {
      await adminService.assignIssue(issueId, officerId);
      toast.success("Officer assigned successfully");
      fetchIssues(); // Refresh list
    } catch (error) {
      toast.error("Assignment failed");
    }
  };

  const handlePriority = async (issueId, priority) => {
    try {
      await adminService.updatePriority(issueId, priority);
      toast.success("Priority updated");
      fetchIssues();
    } catch (error) {
      toast.error("Priority update failed");
    }
  };

  if (loading && issues.length === 0) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Issue Management</h1>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            className="border rounded p-2"
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }));

              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Reopened">Reopened</option>
          </select>
          <select
            className="border rounded p-2"
            value={filters.priority}
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                priority: e.target.value,
              }));

              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Issue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assign Officer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {issues.map((issue) => (
              <tr key={issue._id}>
                <td className="px-6 py-4 text-sm font-medium">
                  <Link
                    to={`/admin/issues/${issue._id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {issue.title}
                  </Link>

                  <p className="text-xs text-gray-400 mt-1">
                    Click to review issue
                  </p>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={issue.priority || ""}
                    onChange={(e) => handlePriority(issue._id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={issue.assignedOfficer?._id || ""}
                    onChange={(e) => handleAssign(issue._id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="">Unassigned</option>
                    {officers.map((off) => (
                      <option key={off._id} value={off._id}>
                        {off.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm min-w-[240px]">
                  {issue.location?.coordinates?.length === 2 ? (
                    <div className="space-y-2">
                      <IssueLocationMap
                        latitude={issue.location.coordinates[1]}
                        longitude={issue.location.coordinates[0]}
                        selectable={false}
                        height="120px"
                      />

                      <p className="text-xs text-gray-500">
                        {issue.address ||
                          `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`}
                      </p>

                      <a
                        href={mapProvider.getMapUrl(
                          issue.location.coordinates[1],
                          issue.location.coordinates[0],
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Open Map
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Location not provided
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">{issue.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminIssues;
