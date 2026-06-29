import React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-premium-border bg-premium-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-sm ${className}`} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <thead className={`bg-premium-subtle/50 text-xs font-bold uppercase tracking-wider text-premium-muted ${className}`}>{children}</thead>;
}

export function TableBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-premium-border ${className}`}>{children}</tbody>;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export function TableRow({ children, className = "", ...props }: TableRowProps) {
  return <tr className={`transition-colors hover:bg-premium-bg/40 ${className}`} {...props}>{children}</tr>;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableHead({ children, className = "", ...props }: TableHeadProps) {
  return <th className={`px-6 py-4 font-bold ${className}`} {...props}>{children}</th>;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return <td className={`px-6 py-4 text-neutral-700 ${className}`} {...props}>{children}</td>;
}
