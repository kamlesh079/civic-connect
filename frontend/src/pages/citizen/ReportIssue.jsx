import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { issueService } from "../../services/issueService";

import { categoryService } from "../../services/categoryService";

import { Spinner } from "../../components/ui/Spinner";
import { IssueLocationMap } from "../../components/map/IssueLocationMap";

import { locationService } from "../../services/locationService";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ReportIssue = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const locationRequestRef = useRef(false);

  const locationToastRef = useRef(null);

  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    coordinates: [],
    priority: "Medium",
  });

  /*
   * We keep actual File objects here.
   *
   * We do NOT convert them to Base64 anymore.
   */
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();

        setCategories(res.data);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    e.target.value = "";

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);

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

    setImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const removed = prev[indexToRemove];

      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const getLocation = () => {
    /*
     * Prevent another GPS request from starting
     * while one is already running.
     *
     * useRef is used here instead of relying only
     * on React state because state updates are
     * asynchronous.
     */
    if (locationRequestRef.current) {
      return;
    }

    locationRequestRef.current = true;

    setIsGettingLocation(true);

    /*
     * Only dismiss the previous location toast.
     * Do not dismiss unrelated application toasts.
     */
    if (locationToastRef.current) {
      toast.dismiss(locationToastRef.current);

      locationToastRef.current = null;
    }

    if (!navigator.geolocation) {
      locationRequestRef.current = false;

      setIsGettingLocation(false);

      locationToastRef.current = toast.error(
        "Geolocation is not supported by your browser. You can select the location directly on the map.",
      );

      return;
    }

    /*
     * Show exactly one loading toast for the
     * current location request.
     */
    locationToastRef.current = toast.loading(
      "Getting your current location...",
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        /*
         * Store coordinates in the format
         * required by MongoDB GeoJSON:
         *
         * [longitude, latitude]
         */
        setFormData((prev) => ({
          ...prev,

          coordinates: [longitude, latitude],
        }));

        /*
         * The GPS request itself succeeded.
         * Replace the loading toast instead of
         * creating another toast.
         */
        if (locationToastRef.current) {
          toast.success("Current location captured successfully", {
            id: locationToastRef.current,
          });
        } else {
          locationToastRef.current = toast.success(
            "Current location captured successfully",
          );
        }

        /*
         * GPS request is finished.
         * The button can be used again.
         */
        locationRequestRef.current = false;

        setIsGettingLocation(false);
      },

      (error) => {
        console.error("Geolocation error:", error);

        locationRequestRef.current = false;

        setIsGettingLocation(false);

        let message =
          "Unable to retrieve your location. You can select the location directly on the map.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. You can select the location directly on the map.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Your current location is unavailable. You can select the location directly on the map.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "Location request timed out. Please try again or select the location directly on the map.";
        }

        /*
         * Replace the existing loading toast
         * instead of creating a second toast.
         */
        if (locationToastRef.current) {
          toast.error(message, {
            id: locationToastRef.current,
          });
        } else {
          locationToastRef.current = toast.error(message);
        }
      },

      {
        /*
         * We don't need extremely high GPS
         * accuracy for civic issue reporting.
         *
         * This also makes repeated requests
         * more reliable and faster.
         */
        enableHighAccuracy: false,

        /*
         * Allow a recent browser location to
         * be reused for up to one minute.
         */
        maximumAge: 60000,

        /*
         * Give the browser enough time to
         * retrieve the location.
         */
        timeout: 15000,
      },
    );
  };

  const handleMapLocationSelect = async ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,

      coordinates: [longitude, latitude],
    }));

    setIsResolvingAddress(true);

    const address = await locationService.reverseGeocode(latitude, longitude);

    if (address) {
      setFormData((prev) => ({
        ...prev,
        address,
      }));

      toast.success("Location selected and address detected");
    } else {
      toast.success("Location selected successfully");
    }

    setIsResolvingAddress(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select a category");

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      payload.append("title", formData.title);

      payload.append("description", formData.description);

      payload.append("category", formData.category);

      payload.append("priority", formData.priority);

      /*
       * Address is optional.
       *
       * It can come from reverse geocoding
       * or from the citizen manually entering
       * an address/landmark.
       */
      if (formData.address.trim()) {
        payload.append("address", formData.address.trim());
      }

      /*
       * Location is optional.
       *
       * If GPS permission is denied and
       * the citizen does not select a map
       * location, the issue can still be
       * submitted.
       *
       * MongoDB stores:
       * [longitude, latitude]
       */
      if (formData.coordinates.length === 2) {
        payload.append(
          "location",
          JSON.stringify({
            type: "Point",

            coordinates: formData.coordinates,
          }),
        );
      }

      images.forEach(({ file }) => {
        payload.append("images", file);
      });

      const res = await issueService.createIssue(payload);

      toast.success("Issue reported successfully!");

      navigate(`/citizen/issues/${res.data.id || res.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to report issue");

      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Report a Civic Issue
        </h1>

        <p className="text-gray-600 mt-1">
          Provide details about the problem to help authorities resolve it
          faster.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="title"
                required
                maxLength={100}
                placeholder="e.g., Massive pothole on Main Street"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                  <span className="text-red-500">*</span>
                </label>

                <select
                  name="category"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>

                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>

                <select
                  name="priority"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>

                  <option value="Medium">Medium</option>

                  <option value="High">High</option>

                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                required
                rows={4}
                maxLength={1000}
                placeholder="Describe the issue in detail..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MapPin className="mr-2 text-blue-600" size={20} />
              Location Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address / Landmark
              </label>

              <input
                type="text"
                name="address"
                placeholder="e.g., Near City Mall, Sector 4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.address}
                onChange={handleChange}
              />

              <p className="text-xs text-gray-500 mt-1">
                This can be detected automatically from the map or entered
                manually.
              </p>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Issue Location
                  </label>

                  <p className="text-xs text-gray-500 mt-1">
                    Click anywhere on the map to select the exact issue
                    location.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none transition-colors flex items-center justify-center"
                >
                  {isGettingLocation ? (
                    <Spinner size={16} className="mr-2" />
                  ) : (
                    <MapPin size={16} className="mr-2" />
                  )}

                  {isGettingLocation ? "Acquiring..." : "Use Current Location"}
                </button>
              </div>

              <IssueLocationMap
                latitude={
                  formData.coordinates.length === 2
                    ? formData.coordinates[1]
                    : null
                }
                longitude={
                  formData.coordinates.length === 2
                    ? formData.coordinates[0]
                    : null
                }
                onLocationSelect={handleMapLocationSelect}
                selectable={true}
                height="360px"
              />

              {formData.coordinates.length === 2 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    Selected Coordinates
                  </p>

                  <p className="text-sm text-green-700 mt-1">
                    Latitude: {formData.coordinates[1].toFixed(6)}
                    <br />
                    Longitude: {formData.coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}

              {isResolvingAddress && (
                <p className="text-xs text-blue-600 mt-2">
                  Detecting a human-readable address...
                </p>
              )}

              {formData.coordinates.length === 0 && (
                <p className="text-xs text-gray-500 flex items-center mt-2">
                  <AlertCircle size={12} className="mr-1" />
                  Location is optional. If GPS permission is denied, you can
                  select a location on the map or continue without a location.
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Camera className="mr-2 text-blue-600" size={20} />
              Photographic Evidence
            </h3>

            <p className="text-sm text-gray-500">
              Upload up to 5 JPG, PNG, or WebP images. Each image must be 5 MB
              or smaller.
            </p>

            <div className="flex flex-wrap gap-4">
              {images.map((image, index) => (
                <div
                  key={`${image.file.name}-${index}`}
                  className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200"
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  <Camera size={24} className="text-gray-400 mb-1" />

                  <span className="text-xs text-gray-500">Add Photo</span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isSubmitting ? (
              <>
                <Spinner size={18} className="mr-2 text-white" />
                Submitting...
              </>
            ) : (
              "Submit Issue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
