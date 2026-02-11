import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for better usage throughout the app
// These provide better autocomplete and type safety even in JavaScript

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Export for convenience
export { useDispatch, useSelector };
