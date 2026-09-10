import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { officerService } from '../../services/officerService';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeft, Save, MapPin, User } from 'lucide-react';

export const OfficerIssueDetails = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await officerService.getIssueDetails(id);
        setIssue(res.data);
        setStatus(res.data.status);
        setRemarks(res.data.resolutionDetails?.remarks || '');
      } catch (error) {
        toast.error('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (status === 'Resolved' && !remarks.trim()) {
      toast.error('Please provide resolution remarks before resolving the issue.');
      return;
    }

    setIsUpdating(true);

    try {
      let res;

      if (status === 'Resolved') {
        // Resolved has its own backend endpoint
        res = await officerService.resolveIssue(id, remarks.trim());
      } else {
        // Assigned / In Progress use the status endpoint
        res = await officerService.updateIssueStatus(
          id,
          status,
          remarks.trim()
        );
      }

      setIssue(res.data);
      setStatus(res.data.status);
      setRemarks(res.data.resolutionDetails?.remarks || '');

      toast.success('Issue updated successfully');
    } catch (error) {
      console.error('Update issue error:', error);

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to update issue'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="h-64 flex"><Spinner size={40} className="m-auto" /></div>;
  if (!issue) return <div className="p-6 text-gray-500">Issue not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/officer/issues" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600">
        <ArrowLeft size={16} className="mr-1" /> Back to Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Issue Details Column (Left - Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
                <PriorityBadge priority={issue.priority} />
              </div>
              <p className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-1" /> {issue.address}
              </p>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Description</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{issue.description}</p>
            </div>
            
            {/* Image display can go here if images array exists */}
            {issue.images && issue.images.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Evidence</h3>
                <div className="flex flex-wrap gap-4">
                  {issue.images.map((img, i) => (
                    <img key={i} src={img} alt={`Evidence ${i+1}`} className="h-32 w-32 object-cover rounded-md border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Column (Right - Takes 1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Status</h3>
            
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Current Status</span>
                <StatusBadge status={issue.status} />
              </div>
              <div className="flex items-center mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                <User size={16} className="mr-2 text-gray-400" />
                Reported by: {issue.citizen?.name || 'Citizen'}
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Update / Resolution Notes</label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Detail the actions taken..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  required={status === 'Resolved'}
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating || (status === issue.status && remarks === (issue.resolutionDetails?.remarks || ''))}
                className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? <Spinner size={18} /> : <><Save size={18} className="mr-2" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};