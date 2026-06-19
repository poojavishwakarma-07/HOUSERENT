import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { AuthContext } from './AuthContext';

export const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchFavorites = async () => {
    if (!user || user.role !== 'tenant') return;
    setLoading(true);
    try {
      const res = await apiClient.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync favorites when user changes
  useEffect(() => {
    if (user && user.role === 'tenant') {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Add a property to favorites
  const addFavorite = async (propertyId) => {
    try {
      const res = await apiClient.post('/favorites', { propertyId });
      if (res.data.success) {
        // Refetch favorites list to update state with populated property details
        await fetchFavorites();
        return { success: true };
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return { success: false, message: err.response?.data?.message || 'Error adding to wishlist' };
    }
  };

  // Remove a property from favorites
  const removeFavorite = async (propertyId) => {
    try {
      const res = await apiClient.delete(`/favorites/${propertyId}`);
      if (res.data.success) {
        setFavorites((prev) => prev.filter((fav) => {
          const pId = fav.propertyId?._id || fav.propertyId;
          return pId !== propertyId;
        }));
        return { success: true };
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return { success: false, message: err.response?.data?.message || 'Error removing from wishlist' };
    }
  };

  // Helper function to check if a property is favorite
  const isFavorite = (propertyId) => {
    return favorites.some((fav) => {
      const pId = fav.propertyId?._id || fav.propertyId;
      return pId === propertyId;
    });
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        loading,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};
