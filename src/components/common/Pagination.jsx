import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination = ({ currentPage = 1, totalItems = 0, pageSize = 10, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50] }) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    if (totalItems === 0) return null;
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };
    const btnBase = "p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-all";
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-gray-100 px-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium w-full sm:w-auto justify-between sm:justify-start">
                <span>
                    Showing <span className="font-bold text-gray-900">{startItem}</span>
                    {" \u2013 "}
                    <span className="font-bold text-gray-900">{endItem}</span>
                    {" of "}
                    <span className="font-bold text-gray-900">{totalItems}</span>
                    {" records"}
                </span>
                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
                        <span className="text-gray-400">Rows:</span>
                        <select value={pageSize} onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            {pageSizeOptions.map((opt) => (<option key={opt} value={opt}>{opt} / page</option>))}
                        </select>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={btnBase}><ChevronsLeft className="w-4 h-4" /></button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={btnBase + " mr-1"}><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                        page === "..." ? (
                            <span key={"e" + idx} className="px-2 py-1 text-xs text-gray-400">...</span>
                        ) : (
                            <button key={"p" + page} onClick={() => onPageChange(page)} className={[
                                "min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all",
                                currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 active:scale-95"
                            ].join(" ")}>{page}</button>
                        )
                    )}
                </div>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={btnBase + " ml-1"}><ChevronRight className="w-4 h-4" /></button>
                <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={btnBase}><ChevronsRight className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

export default Pagination;