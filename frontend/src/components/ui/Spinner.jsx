import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, className = '' }) => (
  <div className={`flex justify-center items-center ${className}`}>
    <Loader2 size={size} className="animate-spin text-blue-600" />
  </div>
);