import { LOGIN_BACKGROUND_IMAGES } from '../constants/loginImages';

/**
 * Get a random image from a different category than the current one
 * @param {string} currentImage - The current image filename
 * @returns {string} A random image from a different category
 */
export const getRandomImageDifferentCategory = (currentImage) => {
  const currentCategory = Object.keys(LOGIN_BACKGROUND_IMAGES).find(cat =>
    LOGIN_BACKGROUND_IMAGES[cat].includes(currentImage)
  );
  
  // Get all categories except the current one
  const otherCategories = Object.keys(LOGIN_BACKGROUND_IMAGES).filter(
    cat => cat !== currentCategory
  );
  
  // Pick a random category
  const randomCategory = otherCategories[
    Math.floor(Math.random() * otherCategories.length)
  ];
  
  // Pick a random image from that category
  const categoryImages = LOGIN_BACKGROUND_IMAGES[randomCategory];
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
};

/**
 * Initialize grid with diverse images (no adjacent similar images)
 * @param {number} gridSize - Total number of grid cells
 * @returns {string[]} Array of image filenames
 */
export const initializeGrid = (gridSize = 64) => {
  const grid = [];
  const categories = Object.keys(LOGIN_BACKGROUND_IMAGES);
  
  for (let i = 0; i < gridSize; i++) {
    // Try to avoid using the same category for adjacent cells
    const adjacentIndices = [i - 1, i - 8]; // left and top
    const adjacentCategories = adjacentIndices
      .filter(idx => idx >= 0 && grid[idx])
      .map(idx => {
        const img = grid[idx];
        return Object.keys(LOGIN_BACKGROUND_IMAGES).find(cat =>
          LOGIN_BACKGROUND_IMAGES[cat].includes(img)
        );
      });
    
    // Filter out adjacent categories
    const availableCategories = categories.filter(
      cat => !adjacentCategories.includes(cat)
    );
    
    const selectedCategory = availableCategories.length > 0
      ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
      : categories[Math.floor(Math.random() * categories.length)];
    
    const categoryImages = LOGIN_BACKGROUND_IMAGES[selectedCategory];
    const selectedImage = categoryImages[
      Math.floor(Math.random() * categoryImages.length)
    ];
    
    grid.push(selectedImage);
  }
  
  return grid;
};
