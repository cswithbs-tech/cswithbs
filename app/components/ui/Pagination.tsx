"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  showLimitSelector?: boolean;
  currentLimit?: number;
  limitOptions?: number[];
}

export const Pagination = ({ 
  totalPages, 
  showLimitSelector = false, 
  currentLimit = 10,
  limitOptions = [10, 20, 50, 100]
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", "1"); // Reset to page 1 on limit change
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1 && !showLimitSelector) return null;

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Simplified logic for now: show start, end, and around current
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-6 mt-4">
      {/* Spacer to push pagination to center on desktop */}
      <div className="hidden sm:block flex-1" />

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors border ${
                    currentPage === page
                      ? "bg-accent text-black border-accent"
                      : "bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span
                  key={index}
                  className="w-10 h-10 flex items-center justify-center text-zinc-600"
                >
                  ...
                </span>
              )
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}

      {/* Limit Selector */}
      <div className="flex-1 flex justify-end w-full sm:w-auto border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
        {showLimitSelector && (
          <div className="flex items-center justify-between sm:justify-end w-full gap-2 text-sm text-zinc-400">
            <span className="font-medium">Rows per page:</span>
            <select
              value={currentLimit}
              onChange={handleLimitChange}
              className="bg-zinc-900 border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.2rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2rem" }}
            >
              {limitOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
