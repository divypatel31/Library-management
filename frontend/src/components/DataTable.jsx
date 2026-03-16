import { motion } from 'framer-motion';

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col, index) => (
              <th
                key={index}
                className="py-4 px-6 font-semibold text-sm text-slate-500 font-display uppercase tracking-wider whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                // UPDATE: Support multiple ID formats from MySQL queries
                key={row.book_id || row.user_id || row.issue_id || row._id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-4 px-6 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;