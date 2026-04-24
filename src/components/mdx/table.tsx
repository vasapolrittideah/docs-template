import React from 'react';

interface TableProps {
  children: React.ReactNode;
}

const Table = ({ children }: TableProps) => {
  return (
    <div className="mb-4 w-full max-w-fit overflow-hidden rounded-xl">
      <div className="table-wrapper border-stroke-soft-200 overflow-x-auto rounded-xl border">
        <table>{children}</table>
      </div>
    </div>
  );
};

export default Table;
