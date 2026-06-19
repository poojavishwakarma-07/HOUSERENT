import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [compareList, setCompareList] = useState([]);

  // Fetch properties list with filtering
  const fetchProperties = useCallback(async (filtersObj = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      if (filtersObj.search) params.search = filtersObj.search;
      if (filtersObj.propertyType) params.propertyType = filtersObj.propertyType;
      if (filtersObj.bedrooms) params.bedrooms = filtersObj.bedrooms;
      if (filtersObj.bathrooms) params.bathrooms = filtersObj.bathrooms;
      if (filtersObj.minRent) params.minRent = filtersObj.minRent;
      if (filtersObj.maxRent) params.maxRent = filtersObj.maxRent;
      if (filtersObj.sort) params.sort = filtersObj.sort;
      if (filtersObj.page) params.page = filtersObj.page;
      params.limit = filtersObj.limit || 12;

      const res = await apiClient.get('/properties', { params });
      
      if (res.data.success) {
        if (filtersObj.page && filtersObj.page > 1) {
          setProperties((prev) => [...prev, ...res.data.data]);
        } else {
          setProperties(res.data.data);
        }
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching properties');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single property
  const fetchProperty = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/properties/${id}`);
      if (res.data.success) {
        setCurrentProperty(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching property details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a property
  const createProperty = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setLoading(false);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating property';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // Update a property
  const updateProperty = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setLoading(false);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating property';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // Delete a property
  const deleteProperty = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.delete(`/properties/${id}`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error deleting property';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  // Properties comparison logic
  const toggleCompare = (property) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p._id === property._id);
      if (exists) {
        return prev.filter((p) => p._id !== property._id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare up to 3 properties at a time.');
          return prev;
        }
        return [...prev, property];
      }
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        currentProperty,
        loading,
        error,
        pagination,
        compareList,
        fetchProperties,
        fetchProperty,
        createProperty,
        updateProperty,
        deleteProperty,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};
