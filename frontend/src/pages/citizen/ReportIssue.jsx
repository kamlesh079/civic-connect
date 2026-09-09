import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { issueService } from '../../services/issueService';
import { categoryService } from '../../services/categoryService';
import { Spinner } from '../../components/ui/Spinner';

export const ReportIssue = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    coordinates: [], // [longitude, latitude]
    priority: 'Medium'
  });
  
  const [images, setImages] = useState([]); // Stores Base64 strings for preview and payload

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data);
      } catch (error) {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection & Preview (Convert to Base64)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('You can only upload a maximum of 5 images');
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // HTML5 Geolocation
  const getLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          coordinates: [position.coords.longitude, position.coords.latitude]
        });
        toast.success('Location captured successfully');
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error('Unable to retrieve your location. Please check browser permissions.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.coordinates.length === 0) {
      toast.error('Please capture your location before submitting');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        priority: formData.priority,
        images: images,
        location: {
          type: 'Point',
          coordinates: formData.coordinates
        }
      };

      const res = await issueService.createIssue(payload);
      toast.success('Issue reported successfully!');
      navigate(`/citizen/issues/${res.data.id || res.data._id}`); // Redirect to new issue
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report issue');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report a Civic Issue</h1>
        <p className="text-gray-600 mt-1">Provide details about the problem to help authorities resolve it faster.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  name="category"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MapPin className="mr-2 text-blue-600" size={20} /> Location Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address / Landmark <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g., Near City Mall, Sector 4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPS Coordinates <span className="text-red-500">*</span></label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none transition-colors flex items-center"
                >
                  {isGettingLocation ? <Spinner size={16} className="mr-2" /> : <MapPin size={16} className="mr-2" />}
                  {isGettingLocation ? 'Acquiring...' : 'Get Current Location'}
                </button>
                
                {formData.coordinates.length > 0 && (
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    ✓ Coordinates captured: {formData.coordinates[1].toFixed(4)}, {formData.coordinates[0].toFixed(4)}
                  </span>
                )}
              </div>
              {formData.coordinates.length === 0 && (
                <p className="text-xs text-red-500 flex items-center mt-2">
                  <AlertCircle size={12} className="mr-1" /> GPS coordinates are required to dispatch officers accurately.
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Image Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Camera className="mr-2 text-blue-600" size={20} /> Photographic Evidence
            </h3>
            <p className="text-sm text-gray-500">Upload up to 5 images showing the issue clearly.</p>
            
            <div className="flex flex-wrap gap-4">
              {images.map((imgSrc, index) => (
                <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                  <img src={imgSrc} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  <Camera size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
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
            {isSubmitting ? <><Spinner size={18} className="mr-2 text-white" /> Submitting...</> : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
};