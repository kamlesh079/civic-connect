export const StatusBadge = ({ status }) => {
  const styles = {
    'Submitted': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-purple-100 text-purple-800',
    'Assigned': 'bg-indigo-100 text-indigo-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Reopened': 'bg-orange-100 text-orange-800'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority}
    </span>
  );
};