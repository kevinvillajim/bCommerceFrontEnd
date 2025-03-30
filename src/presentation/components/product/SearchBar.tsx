import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch 
}) => {
  return (
    <div className="mb-8">
      <form onSubmit={onSearch} className="relative">
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          value={searchTerm}
          onChange={onSearchChange}
        />
        <button 
          type="submit" 
          className="absolute right-3 top-3 text-gray-400 hover:text-primary-600"
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;