import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeImportProps {
  onImport: (recipes: Recipe[]) => void;
}

export function RecipeImport({ onImport }: RecipeImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim());
    const headers = rows[0].split(',').map(h => h.trim());
    
    try {
      const recipes: Recipe[] = [];
      let currentRecipe: Partial<Recipe> | null = null;
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // If we have a recipe name, start a new recipe
        if (rowData.recipeName) {
          // If we have a current recipe, save it before starting a new one
          if (currentRecipe?.name && currentRecipe.ingredients?.length > 0) {
            recipes.push(currentRecipe as Recipe);
          }
          
          currentRecipe = {
            id: crypto.randomUUID(),
            name: rowData.recipeName,
            salePrice: parseFloat(rowData.salePrice) || 0,
            ingredients: []
          };
        }

        // Add ingredient to current recipe
        if (currentRecipe && rowData.ingredientName) {
          currentRecipe.ingredients.push({
            id: crypto.randomUUID(),
            name: rowData.ingredientName,
            quantity: parseFloat(rowData.quantity) || 0,
            unit: rowData.unit || '',
            isVariable: rowData.isVariable?.toLowerCase() === 'true'
          });
        }
      }

      // Don't forget to add the last recipe
      if (currentRecipe?.name && currentRecipe.ingredients?.length > 0) {
        recipes.push(currentRecipe as Recipe);
      }

      if (recipes.length > 0) {
        onImport(recipes);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error('No valid recipes found in the CSV file');
      }
    } catch (error) {
      console.error('Error parsing recipe CSV:', error);
      alert('Error parsing CSV file. Please check the format.');
    }
  };

  return (
    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md flex items-center gap-2">
      <Upload size={20} />
      Import Recipes
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