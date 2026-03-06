import { useState, useEffect } from 'react';
import { getRandomImageDifferentCategory, initializeGrid } from '../utils/imageGrid';
import { GRID_SIZE, TRANSITION_INTERVAL } from '../constants/loginImages';

/**
 * Custom hook for managing animated image grid
 * @returns {string[]} Array of current grid images
 */
export const useImageGrid = () => {
  // Start with empty array to avoid hydration mismatch
  const [gridImages, setGridImages] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize grid only on client side
  useEffect(() => {
    setIsClient(true);
    setGridImages(initializeGrid(GRID_SIZE));
  }, []);

  useEffect(() => {
    // Don't start animation until we have images
    if (!isClient || gridImages.length === 0) return;
    
    const interval = setInterval(() => {
      setGridImages(prev => 
        prev.map(currentImg => getRandomImageDifferentCategory(currentImg))
      );
    }, TRANSITION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isClient, gridImages.length]);

  return gridImages;
};
