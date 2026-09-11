import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  User,
  Mail,
  Shield,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { adminService } from "../../services/adminService";
import { Spinner } from "../../components/ui/Spinner";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badges";
import { IssueLocationMap } from "../../components/map/IssueLocationMap";
import { mapProvider } from "../../components/map/mapProvider";

const AdminIssueDetails = () => {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await adminService.getIssueDetails(id);
        setIssue(res.data);
      } catch (error) {
        toast.error("Failed to load issue details");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleStatusUpdate = async (event, statusOverride = null) => {
    event.preventDefault();

    const selectedStatus = statusOverride || status;

    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    if (selectedStatus === "Rejected" && !remarks.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setIsUpdating(true);

      const res = await adminService.updateIssueStatus(
        id,
        selectedStatus,
        remarks,
      );

      setIssue(res.data);

      setStatus("");
      setRemarks("");

      toast.success(`Issue marked as ${res.data.status}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update issue status",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex">
        <Spinner size={40} className="m-auto" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/issues"
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Issue Management
        </Link>

        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          Issue could not be found.
        </div>
      </div>
    );
  }

  const proofImages = issue.resolutionDetails?.imageUrls?.length
    ? issue.resolutionDetails.imageUrls
    : issue.resolutionDetails?.imageUrl
      ? [issue.resolutionDetails.imageUrl]
      : [];

  const hasLocation = issue.location?.coordinates?.length === 2;

  const latitude = hasLocation ? issue.location.coordinates[1] : null;

  const longitude = hasLocation ? issue.location.coordinates[0] : null;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back */}
      <Link
        to="/admin/issues"
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Issue Management
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                Issue ID
              </p>

              <p className="text-xs text-gray-500 mb-3 break-all">
                {issue._id}
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                {issue.title}
              </h1>

              <div className="flex flex-wrap gap-4 items-center mt-3 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {new Date(issue.createdAt).toLocaleString()}
                </span>

                {issue.category?.name && (
                  <span>
                    Category: <strong>{issue.category.name}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={issue.priority} />
              <StatusBadge status={issue.status} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Issue Description
            </h2>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>
          </section>

          {/* Citizen Evidence */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-3 flex items-center">
              <Camera size={17} className="mr-2" />
              Citizen Evidence
            </h2>

            {issue.images?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {issue.images.map((image, index) => (
                  <a
                    key={`${image}-${index}`}
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={image}
                      alt={`Citizen evidence ${index + 1}`}
                      className="w-full aspect-square rounded-lg object-cover border border-gray-200 bg-gray-50 hover:opacity-90 transition"
                    />

                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Evidence {index + 1}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
                No images were submitted with this issue.
              </div>
            )}
          </section>

          {/* Location */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-3 flex items-center">
              <MapPin size={17} className="mr-2" />
              Issue Location
            </h2>

            {hasLocation ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <IssueLocationMap
                  latitude={latitude}
                  longitude={longitude}
                  selectable={false}
                  height="360px"
                />

                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    {issue.address || "Location selected on map"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Latitude: {latitude.toFixed(6)}
                    {" · "}
                    Longitude: {longitude.toFixed(6)}
                  </p>

                  <a
                    href={mapProvider.getMapUrl(latitude, longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
                No location was provided by the citizen.
              </div>
            )}
          </section>

          {/* Reporter + Assignment */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Report & Assignment Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reporter */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center mb-3">
                  <User size={18} className="mr-2 text-gray-500" />

                  <h3 className="font-medium text-gray-800">Reported By</h3>
                </div>

                <p className="text-gray-900 font-medium">
                  {issue.reportedBy?.name || "Unknown citizen"}
                </p>

                {issue.reportedBy?.email && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <Mail size={14} className="mr-1" />
                    {issue.reportedBy.email}
                  </p>
                )}
              </div>

              {/* Officer */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center mb-3">
                  <UserCheck size={18} className="mr-2 text-gray-500" />

                  <h3 className="font-medium text-gray-800">
                    Assigned Officer
                  </h3>
                </div>

                {issue.assignedOfficer ? (
                  <>
                    <p className="text-gray-900 font-medium">
                      {issue.assignedOfficer.name}
                    </p>

                    {issue.assignedOfficer.department && (
                      <p className="text-sm text-gray-600 mt-1">
                        Department: {issue.assignedOfficer.department}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No officer assigned.</p>
                )}
              </div>
            </div>
          </section>

          {/* Resolution */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-3">
              Resolution Information
            </h2>

            {issue.resolutionDetails?.remarks ||
            proofImages.length > 0 ||
            issue.resolutionDetails?.resolvedAt ? (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 space-y-4">
                {issue.resolutionDetails?.remarks && (
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">
                      Resolution Notes
                    </h3>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {issue.resolutionDetails.remarks}
                    </p>
                  </div>
                )}

                {issue.resolutionDetails?.resolvedAt && (
                  <p className="text-sm text-gray-600">
                    Resolved on:{" "}
                    {new Date(
                      issue.resolutionDetails.resolvedAt,
                    ).toLocaleString()}
                  </p>
                )}

                {proofImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-3">
                      Resolution Proof
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {proofImages.map((image, index) => (
                        <a
                          key={`${image}-${index}`}
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={image}
                            alt={`Resolution proof ${index + 1}`}
                            className="w-full aspect-square rounded-lg object-cover border border-green-200 bg-white hover:opacity-90 transition"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
                No resolution information is available yet.
              </div>
            )}
          </section>

          {/* Status History */}
          <section>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-3 flex items-center">
              <Shield size={17} className="mr-2" />
              Status History
            </h2>

            {issue.statusHistory?.length > 0 ? (
              <div className="space-y-3">
                {issue.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={`${entry.changedAt}-${index}`}
                      className="border border-gray-100 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {entry.status}
                          </span>

                          {entry.changedBy?.name && (
                            <p className="text-sm text-gray-600 mt-1">
                              Changed by: {entry.changedBy.name}
                              {entry.changedBy.role
                                ? ` (${entry.changedBy.role})`
                                : ""}
                            </p>
                          )}

                          {entry.remarks && (
                            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                              {entry.remarks}
                            </p>
                          )}
                        </div>

                        {entry.changedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(entry.changedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-500">
                No status history is available for this issue.
              </div>
            )}
          </section>

          {/* Admin Actions */}
          <section className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">Admin Actions</h2>

              <p className="text-sm text-gray-500 mt-1">
                Review the submitted report and evidence before taking an
                action.
              </p>
            </div>

            {/* Current status */}
            <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Current Status:
                </span>

                <StatusBadge status={issue.status} />
              </div>
            </div>

            {/* Submitted → Under Review / Rejected */}
            {issue.status === "Submitted" && (
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Admin Decision
                  </label>

                  <select
                    id="admin-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select an action</option>

                    <option value="Under Review">Mark Under Review</option>

                    <option value="Rejected">Reject Issue</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-remarks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Remarks
                  </label>

                  <textarea
                    id="admin-remarks"
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      status === "Rejected"
                        ? "Explain why this issue is being rejected..."
                        : "Add review remarks..."
                    }
                    required={status === "Rejected"}
                    className="w-full border border-gray-300 rounded-md p-2 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating || !status}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Issue Status"}
                </button>
              </form>
            )}

            {/* Under Review → Reject */}
            {issue.status === "Under Review" && (
              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label
                    htmlFor="review-status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Review Decision
                  </label>

                  <select
                    id="review-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select an action</option>

                    <option value="Rejected">Reject Issue</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="review-remarks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Review Remarks
                  </label>

                  <textarea
                    id="review-remarks"
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Explain your decision..."
                    required
                    className="w-full border border-gray-300 rounded-md p-2 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating || !status}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Reject Issue"}
                </button>
              </form>
            )}

            {/* Resolved → Reopen */}
            {issue.status === "Resolved" && (
              <form
                onSubmit={(event) => handleStatusUpdate(event, "Reopened")}
                className="space-y-4"
              >
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Reopen this issue if the reported problem still exists or
                    the resolution is not satisfactory.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="reopen-remarks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reopen Remarks
                  </label>

                  <textarea
                    id="reopen-remarks"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Explain why this issue needs to be reopened..."
                    required
                    className="w-full border border-gray-300 rounded-md p-2 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Reopening..." : "Reopen Issue"}
                </button>
              </form>
            )}

            {/* No action */}
            {["Assigned", "In Progress", "Rejected", "Reopened"].includes(
              issue.status,
            ) && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  No Admin status decision is available for the current issue
                  status.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminIssueDetails;
