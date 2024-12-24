import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Inventory } from '../../types';

interface InventoryImportProps {
  onImport: (inventory: Inventory[]) => void;
}

export function InventoryImport({ onImport }: InventoryImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const headers = rows[0].split(',').map(h => h.trim());
    
    try {
      const inventoryData = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        return {
          date: rowData.date,
          ingredient: rowData.ingredient,
          stockRemaining: parseFloat(rowData.stockRemaining) || 0
        };
      });

      onImport(inventoryData);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error parsing inventory CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  };

  return (
    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md flex items-center gap-2">
      <Upload size={20} />
      Import Inventory
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>
  );
}