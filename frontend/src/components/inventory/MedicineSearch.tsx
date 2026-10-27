import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface MedicineSearchProps {
  onSearch: (drugName: string) => void;
  isLoading?: boolean;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter generic drug name (e.g. Amoxicillin, Albuterol)..."
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 shadow-xs"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Analyze Risk
      </button>
    </form>
  );
};

export default MedicineSearch;
