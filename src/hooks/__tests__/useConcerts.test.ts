import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useConcerts, useSearchConcerts, useFreeConcerts } from '@/hooks/useConcerts';
import { concertQueries } from '@/lib/supabase';

// Mock the supabase queries
jest.mock('@/lib/supabase', () => ({
  concertQueries: {
    getAll: jest.fn(),
    search: jest.fn(),
    getFree: jest.fn(),
    getUpcoming: jest.fn(),
  }
}));

const mockConcertQueries = concertQueries as jest.Mocked<typeof concertQueries>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  
  return Wrapper;
};

describe('useConcerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useConcerts', () => {
    it('fetches all concerts successfully', async () => {
      const mockConcerts = [
        { id: '1', artist: 'The Strokes', venue: { name: 'Bowery Ballroom' } },
        { id: '2', artist: 'Vampire Weekend', venue: { name: 'Webster Hall' } }
      ];
      
      mockConcertQueries.getAll.mockResolvedValue(mockConcerts as any);
      
      const { result } = renderHook(() => useConcerts(), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockConcerts);
      expect(mockConcertQueries.getAll).toHaveBeenCalledTimes(1);
    });

    it('handles error when fetching concerts fails', async () => {
      const mockError = new Error('Failed to fetch concerts');
      mockConcertQueries.getAll.mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useConcerts(), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useSearchConcerts', () => {
    it('searches concerts with filters', async () => {
      const mockResults = [
        { id: '1', artist: 'The Strokes', genres: ['indie rock'] }
      ];
      
      mockConcertQueries.search.mockResolvedValue(mockResults as any);
      
      const filters = { query: 'indie', genre: 'rock' };
      const { result } = renderHook(() => useSearchConcerts(filters), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockResults);
      expect(mockConcertQueries.search).toHaveBeenCalledWith(filters);
    });

    it('does not fetch when no filters provided', () => {
      const { result } = renderHook(() => useSearchConcerts({}), {
        wrapper: createWrapper(),
      });
      
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockConcertQueries.search).not.toHaveBeenCalled();
    });

    it('refetches when filters change', async () => {
      const mockResults1 = [{ id: '1', artist: 'The Strokes' }];
      const mockResults2 = [{ id: '2', artist: 'Vampire Weekend' }];
      
      mockConcertQueries.search
        .mockResolvedValueOnce(mockResults1 as any)
        .mockResolvedValueOnce(mockResults2 as any);
      
      const { result, rerender } = renderHook(
        ({ filters }) => useSearchConcerts(filters),
        {
          wrapper: createWrapper(),
          initialProps: { filters: { query: 'strokes' } }
        }
      );
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockResults1);
      
      // Change filters
      rerender({ filters: { query: 'vampire' } });
      
      await waitFor(() => {
        expect(mockConcertQueries.search).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useFreeConcerts', () => {
    it('fetches free concerts successfully', async () => {
      const mockFreeConcerts = [
        { id: '1', artist: 'Free Band', price: 'free' }
      ];
      
      mockConcertQueries.getFree.mockResolvedValue(mockFreeConcerts as any);
      
      const { result } = renderHook(() => useFreeConcerts(), {
        wrapper: createWrapper(),
      });
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      
      expect(result.current.data).toEqual(mockFreeConcerts);
      expect(mockConcertQueries.getFree).toHaveBeenCalledTimes(1);
    });
  });
});