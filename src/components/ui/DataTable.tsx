import { Loader2 } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<T>({
  columns, data, loading, keyExtractor,
  emptyMessage = "No data found", emptyIcon,
}: DataTableProps<T>) {
  const rows = Array.isArray(data) ? data : [] as unknown as T[];
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
                <p>{emptyMessage}</p>
              </td>
            </tr>
          )}
          {!loading && rows.map(row => (
            <tr key={keyExtractor(row)}>
              {columns.map(col => (
                <td key={col.key} className={col.className}>
                  {col.render
                    ? col.render(row)
                    : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
