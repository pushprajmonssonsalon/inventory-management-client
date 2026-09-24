import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import transactionReducer from './slices/transactionSlice';
import dashboardReducer from './slices/dashboardSlice';
import themeReducer from './slices/themeSlice';
import damagedReducer from './slices/damagedSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    transactions: transactionReducer,
    dashboard: dashboardReducer,
    theme: themeReducer,
    damaged: damagedReducer,
  },
});
