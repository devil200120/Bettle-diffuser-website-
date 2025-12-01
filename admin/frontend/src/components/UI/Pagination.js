import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../contexts/ThemeContext';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showInfo = true,
  totalItems = 0,
  itemsPerPage = 10
}) => {
  const { isDark } = useTheme();
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
      {/* Mobile pagination */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`px-4 py-2 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isDark 
              ? 'text-gray-300 bg-dark-700 border-dark-600 hover:bg-dark-600' 
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-4 py-2 text-sm font-medium border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            isDark 
              ? 'text-gray-300 bg-dark-700 border-dark-600 hover:bg-dark-600' 
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      
      {/* Desktop pagination */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:w-full">
        {showInfo && (
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Showing <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{startItem}</span> to{' '}
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{endItem}</span> of{' '}
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{totalItems}</span> results
          </p>
        )}
        
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className={clsx(
              `p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`,
              currentPage <= 1 && 'invisible'
            )}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>•••</span>
                )}
              </>
            )}
            
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={clsx(
                  'min-w-[36px] h-9 px-3 text-sm font-semibold rounded-lg transition-all',
                  page === currentPage
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                {page}
              </button>
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className={`px-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>•••</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${
                    isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className={clsx(
              `p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-dark-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`,
              currentPage >= totalPages && 'invisible'
            )}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;