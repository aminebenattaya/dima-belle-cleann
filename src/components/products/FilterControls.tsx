
'use client';

import { useState, useEffect } from 'react';
import type { FilterOptions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';


type FilterControlsProps = {
  options: FilterOptions;
  onFilterChange: (filters: AppliedFilters) => void;
  initialFilters: AppliedFilters;
};

export type AppliedFilters = {
  category: string;
  color: string;
  priceRange: [number, number];
  keywords: string;
};

export default function FilterControls({ options, onFilterChange, initialFilters }: FilterControlsProps) {
  const [category, setCategory] = useState(initialFilters.category);
  const [color, setColor] = useState(initialFilters.color);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange);
  const [keywords, setKeywords] = useState(initialFilters.keywords);

  // This effect syncs the internal state of the filter controls with the URL's state (passed via props).
  // This is crucial for the back/forward buttons to work correctly, as it resets the component's state
  // when the 'initialFilters' prop changes.
  useEffect(() => {
    setCategory(initialFilters.category);
    setColor(initialFilters.color);
    setPriceRange(initialFilters.priceRange);
    setKeywords(initialFilters.keywords);
  }, [initialFilters]);

  // This effect calls the passed onFilterChange function whenever the user changes a filter.
  // It's debounced to avoid excessive calls, especially for the slider and text input.
  useEffect(() => {
    // Only call onFilterChange if the internal state differs from the initial state from props.
    // This prevents firing the callback on the initial render or on state sync.
    if (
      keywords !== initialFilters.keywords ||
      category !== initialFilters.category ||
      color !== initialFilters.color ||
      priceRange[0] !== initialFilters.priceRange[0] ||
      priceRange[1] !== initialFilters.priceRange[1]
    ) {
        const handler = setTimeout(() => {
          onFilterChange({ category, color, priceRange, keywords });
        }, 500); // Debounce input for 500ms

        return () => {
          clearTimeout(handler);
        };
    }
  }, [keywords, category, color, priceRange, onFilterChange, initialFilters]);

  const resetFilters = () => {
    onFilterChange({
      category: options.categories[0] || 'Tout',
      color: options.colors[0] || 'Tout',
      priceRange: options.priceRange,
      keywords: ''
    });
  };

  return (
    <Card className="shadow-lg rounded-lg sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Filtres</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
          <X className="mr-1 h-3 w-3" /> Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        <div>
            <Label htmlFor="search-input" className="text-sm font-medium mb-2 block">Rechercher</Label>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    id="search-input"
                    placeholder="Nom du produit..." 
                    className="pl-9"
                    value={keywords} 
                    onChange={(e) => setKeywords(e.target.value)}
                />
            </div>
        </div>

        <div>
          <Label htmlFor="category-select" className="text-sm font-medium mb-1 block">Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category-select">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {options.categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color-select" className="text-sm font-medium mb-1 block">Couleur</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger id="color-select">
              <SelectValue placeholder="Sélectionner une couleur" />
            </SelectTrigger>
            <SelectContent>
              {options.colors.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1 block">Prix</Label>
          <Slider
            value={priceRange}
            onValueChange={(newRange) => setPriceRange(newRange as [number, number])}
            min={options.priceRange[0]}
            max={options.priceRange[1]}
            step={5}
            className="my-3"
          />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>{priceRange[0]} DT</span>
            <span>{priceRange[1]} DT</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
