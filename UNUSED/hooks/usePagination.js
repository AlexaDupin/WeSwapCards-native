import { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '../helpers/axiosInstance';
import { useAuth } from '@clerk/clerk-react';

export const usePagination = (fetchUrl, itemsPerPage = 20, options = {}) => {
  const { searchTerm = '', includeSearch = false } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const { getToken } = useAuth();
  const abortControllerRef = useRef(new AbortController());

  const fetchData = async () => {
    const fullUrl = `${fetchUrl}?page=${activePage}&limit=${itemsPerPage}` + (includeSearch && searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '');

    if (!fetchUrl) {
      setData([]);
      setLoading(false);
      setError(null);
      setTotalPages(0);
      setTotalItems(0);
      return;
    }

    try {
      setError(null);
      
      // Abort the previous fetch request if it exists
      abortControllerRef.current.abort();
      
      // Create a new abort controller for the current fetch
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get auth token
      let token;
      try {
        token = await getToken();
      } catch (tokenErr) {
        setError("Authentication error. Please try logging in again.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(
        fullUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
          timeout: 8000, 
        }
      );
      // Update state only if the request is not aborted
      if (abortController.signal.aborted) return;
      
      setData(response.data);

      // Set pagination info if available
      if (response.data.pagination) {
        const calculatedTotalPages = Math.ceil(response.data.pagination.totalItems / itemsPerPage);
        setTotalPages(calculatedTotalPages);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        // Default pagination if none provided
        setTotalPages(1);
        setTotalItems(Array.isArray(response.data) ? response.data.length : 0);
      }
      
      setError(null);
    } catch (err) {
      // Don't update state if request was intentionally canceled
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      
      // Set appropriate error message based on error type
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("There was an error reaching the server. Try again.");
      } else {
        setError(err.message || 'There was an error loading the data');
      }
      
      // console.error("Pagination error:", err);

      // Keep existing data on error to allow retry without losing state
    } finally {
      // Always update loading state unless request was aborted
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }
  };
  
  const handlePageChange = (pageNumber) => {
    if (pageNumber === activePage) return;
    setActivePage(pageNumber);
  };
  
  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);
  
  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchUrl, activePage, itemsPerPage]);

  useEffect(() => {
    if (!fetchUrl) return;
    fetchData();
    setActivePage(1);
  }, [searchTerm]);
  
  return {
    data,
    setData,
    loading,
    error,
    activePage,
    totalPages,
    totalItems,
    handlePageChange,
    setActivePage,
    refresh: fetchData
  };
};