import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface DataImportProps {
  onImport: (type: 'orders' | 'sales' | 'inventory', data: any[]) => void;
}

export function DataImport({ onImport }: DataImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'orders' | 'sales' | 'inventory') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',');
    
    const data = rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj: any, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {});
    });

    onImport(type, data);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {(['orders', 'sales', 'inventory'] as const).map((type) => (
          <div key={type} className="flex-1">
            <label
              htmlFor={`${type}-upload`}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500 capitalize">
                  Import {type}
                </p>
              </div>
              <input
                id={`${type}-upload`}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileUpload(e, type)}
                ref={fileInputRef}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}