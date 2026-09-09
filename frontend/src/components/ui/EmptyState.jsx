import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ title, message, icon: Icon = FileQuestion }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
    <div className="bg-gray-50 p-4 rounded-full mb-4">
      <Icon size={40} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 max-w-sm">{message}</p>
  </div>
);