import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { toast } from "react-hot-toast";

import { officerService } from "../../services/officerService";

import { StatusBadge, PriorityBadge } from "../../components/ui/Badges";

import { Spinner } from "../../components/ui/Spinner";

import { ArrowLeft, Save, MapPin, User, Camera, X } from "lucide-react";

import { IssueLocationMap } from "../../components/map/IssueLocationMap";

import { mapProvider } from "../../components/map/mapProvider";

const MAX_IMAGES = 5;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const OfficerIssueDetails = () => {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);

  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");

  const [remarks, setRemarks] = useState("");

  const [resolutionImages, setResolutionImages] = useState([]);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await officerService.getIssueDetails(id);

        setIssue(res.data);

        setStatus(res.data.status);

        setRemarks(res.data.resolutionDetails?.remarks || "");
      } catch (error) {
        toast.error("Failed to load issue details");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleResolutionImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    e.target.value = "";

    if (resolutionImages.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(
        `You can upload a maximum of ${MAX_IMAGES} resolution images`,
      );

      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, and WebP images are allowed`);

        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name}: image must be 5 MB or smaller`);

        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setResolutionImages((prev) => [...prev, ...validFiles]);
  };

  const removeResolutionImage = (index) => {
    setResolutionImages((prev) => {
      const removed = prev[index];

      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (status === "Resolved" && !remarks.trim()) {
      toast.error(
        "Please provide resolution remarks before resolving the issue.",
      );

      return;
    }

    setIsUpdating(true);

    try {
      let res;

      if (status === "Resolved") {
        res = await officerService.resolveIssue(
          id,
          remarks.trim(),
          resolutionImages.map(({ file }) => file),
        );
      } else {
        res = await officerService.updateIssueStatus(
          id,
          status,
          remarks.trim(),
        );
      }

      setIssue(res.data);

      setStatus(res.data.status);

      setRemarks(res.data.resolutionDetails?.remarks || "");

      resolutionImages.forEach(({ preview }) => URL.revokeObjectURL(preview));

      setResolutionImages([]);

      toast.success("Issue updated successfully");
    } catch (error) {
      console.error("Update issue error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update issue",
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
    return <div className="p-6 text-gray-500">Issue not found.</div>;
  }

  const proofImages = issue.resolutionDetails?.imageUrls?.length
    ? issue.resolutionDetails.imageUrls
    : issue.resolutionDetails?.imageUrl
      ? [issue.resolutionDetails.imageUrl]
      : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/officer/issues"
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {issue.title}
                </h1>

                <PriorityBadge priority={issue.priority} />
              </div>

              <p className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-1" />

                {issue.address}
              </p>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                Description
              </h3>

              {issue.location?.coordinates?.length === 2 && (
                <div className="p-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase">
                        Issue Location
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {issue.address || "Location selected on map"}
                      </p>
                    </div>

                    <a
                      href={mapProvider.getMapUrl(
                        issue.location.coordinates[1],
                        issue.location.coordinates[0],
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
                    >
                      Open Map
                    </a>
                  </div>

                  <IssueLocationMap
                    latitude={issue.location.coordinates[1]}
                    longitude={issue.location.coordinates[0]}
                    selectable={false}
                    height="320px"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Latitude: {issue.location.coordinates[1].toFixed(6)}
                    {" · "}
                    Longitude: {issue.location.coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}

              <p className="text-gray-800 whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>

            {issue.images?.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                  Evidence
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {issue.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Evidence ${i + 1}`}
                      className="h-40 w-full object-cover rounded-md border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {proofImages.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-green-50">
                <h3 className="text-sm font-medium text-green-800 uppercase mb-3">
                  Resolution Proof
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {proofImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Resolution proof ${i + 1}`}
                      className="h-40 w-full object-cover rounded-md border border-green-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Manage Status
            </h3>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Current Status</span>

                <StatusBadge status={issue.status} />
              </div>

              <div className="flex items-center mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                <User size={16} className="mr-2 text-gray-400" />
                Reported by:{" "}
                {issue.reportedBy?.name || issue.citizen?.name || "Citizen"}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Assigned">Assigned</option>

                  <option value="In Progress">In Progress</option>

                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update / Resolution Notes
                </label>

                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Detail the actions taken..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  required={status === "Resolved"}
                />
              </div>

              {status === "Resolved" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Camera size={16} className="mr-1" />
                      Resolution Proof
                    </label>

                    <p className="text-xs text-gray-500 mb-2">
                      Upload up to 5 JPG, PNG, or WebP images, 5 MB each.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {resolutionImages.map((image, index) => (
                      <div
                        key={`${image.file.name}-${index}`}
                        className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200"
                      >
                        <img
                          src={image.preview}
                          alt={`Proof preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeResolutionImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          aria-label={`Remove proof image ${index + 1}`}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}

                    {resolutionImages.length < MAX_IMAGES && (
                      <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                        <Camera size={20} className="text-gray-400" />

                        <span className="text-[10px] text-gray-500">
                          Add Photo
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={handleResolutionImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isUpdating ||
                  (status === issue.status &&
                    remarks === (issue.resolutionDetails?.remarks || "") &&
                    resolutionImages.length === 0)
                }
                className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <Spinner size={18} />
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
