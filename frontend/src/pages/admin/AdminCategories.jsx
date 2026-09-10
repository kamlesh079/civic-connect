import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import {Spinner} from '../../components/ui/Spinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return toast.error('Category name is required');

    setIsSubmitting(true);
    try {
      await adminService.createCategory(newCategory);
      toast.success('Category created successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Category List */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-6">Issue Categories</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="px-6 py-4 text-sm font-medium">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-6 text-center text-gray-500">No categories found.</div>
          )}
        </div>
      </div>

      {/* Create Form */}
      <div>
        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="e.g., Road Maintenance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full border rounded p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Brief description of the category..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminCategories;