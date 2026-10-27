import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { InventoryRecord } from '../types/inventory';

export const useInventory = (category?: string, search?: string) => {
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getInventory({ category, search });
      setItems(data.records || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [category, search]);

  return { items, isLoading, error, refetch: fetchInventory };
};
