
// src/components/products/ProductView.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import ProductCard from '@/components/products/ProductCard';
import FilterControls, { type AppliedFilters } from '@/components/products/FilterControls';
import type { Product, FilterOptions } from '@/lib/types';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProducts, getUniqueProductColors } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const PRODUCTS_PER_PAGE = 8;

const safeParseInt = (value: string | null, defaultValue: number): number => {
    if (value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

export default function ProductView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const { appliedFilters, currentPage } = useMemo(() => {
    const priceMin = safeParseInt(searchParams.get('priceMin'), 0);
    const priceMax = safeParseInt(searchParams.get('priceMax'), 200);

    const filters: AppliedFilters = {
        category: searchParams.get('category') || 'Tout',
        color: searchParams.get('color') || 'Tout',
        priceRange: [priceMin, priceMax],
        keywords: searchParams.get('keywords') || '',
    };
    const page = safeParseInt(searchParams.get('page'), 1);
    return { appliedFilters: filters, currentPage: page };
  }, [searchParams]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [products, uniqueColors] = await Promise.all([
            getProducts(), // Fetch all products without server-side filtering
            getUniqueProductColors()
        ]);
        
        setAllProducts(products);
        
        setFilterOptions({
            categories: ['Tout', 'Hijab', 'Turban', 'Casquette', 'habillée/soirée', 'Ensemble', 'coiffe'],
            colors: ['Tout', ...uniqueColors],
            sizes: [],
            priceRange: [0, 200]
        });

      } catch (error) {
        console.error("Failed to fetch initial product data:", error);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Run only once on component mount

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    
    if (appliedFilters.category && appliedFilters.category !== 'Tout') {
      products = products.filter(p => p.category === appliedFilters.category);
    }
    if (appliedFilters.priceRange) {
      products = products.filter(p => p.price >= appliedFilters.priceRange[0] && p.price <= appliedFilters.priceRange[1]);
    }
    if (appliedFilters.color && appliedFilters.color !== 'Tout') {
      const filterColorLower = appliedFilters.color.toLowerCase();
      products = products.filter(p => 
        p.colors.some(c => c.name.toLowerCase().includes(filterColorLower))
      );
    }
    if (appliedFilters.keywords) {
      const keywordsLower = appliedFilters.keywords.toLowerCase().split(' ').filter(k => k.length > 1);
      if (keywordsLower.length > 0) {
        products = products.filter(p => {
          const nameLower = p.name.toLowerCase();
          const descriptionLower = p.description.toLowerCase();
          const categoryLower = p.category.toLowerCase();
          const dataAiHintLower = p.dataAiHint?.toLowerCase() || '';
          return keywordsLower.some(kw => 
            nameLower.includes(kw) || 
            descriptionLower.includes(kw) ||
            categoryLower.includes(kw) ||
            dataAiHintLower.includes(kw)
          );
        });
      }
    }
    return products;
  }, [allProducts, appliedFilters]);

  const handleFilterChange = useCallback((filters: AppliedFilters) => {
    const newParams = new URLSearchParams();
    
    const defaultCategory = 'Tout';
    const defaultColor = 'Tout';
    const [defaultPriceMin, defaultPriceMax] = filterOptions?.priceRange || [0, 200];

    if (filters.keywords) newParams.set('keywords', filters.keywords);
    if (filters.category !== defaultCategory) newParams.set('category', filters.category);
    if (filters.color !== defaultColor) newParams.set('color', filters.color);
    if (filters.priceRange[0] !== defaultPriceMin) newParams.set('priceMin', filters.priceRange[0].toString());
    if (filters.priceRange[1] !== defaultPriceMax) newParams.set('priceMax', filters.priceRange[1].toString());

    newParams.set('page', '1');

    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [router, pathname, filterOptions]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('page', page.toString());
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        {filterOptions ? (
            <FilterControls
              options={filterOptions}
              onFilterChange={handleFilterChange}
              initialFilters={appliedFilters}
            />
        ) : (
            <Card className="shadow-lg rounded-lg sticky top-24">
                <CardContent className="p-4">
                    <Skeleton className="h-[500px] w-full" />
                </CardContent>
            </Card>
        )}
      </aside>
      <main className="md:col-span-3 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
              <Card key={i} className="overflow-hidden shadow-lg flex flex-col h-full rounded-lg">
                <Skeleton className="aspect-[3/4] w-full" />
                <CardContent className="p-4 flex-grow">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-1/4" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
            <p className="text-sm mt-2">Essayez d'ajuster vos filtres.</p>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
           <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <PaginationItem key={`page-link-${pageNum}`}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if ((pageNum === currentPage - 2 && currentPage > 3) || (pageNum === currentPage + 2 && currentPage < totalPages - 2)) {
                  return <PaginationEllipsis key={`ellipsis-${pageNum}`} />;
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
}
