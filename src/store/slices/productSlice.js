import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async ({ search, status } = {}, thunkAPI) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/products', { params });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load products');
    }
  }
);

export const addProduct = createAsyncThunk('products/add', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/products', payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, ...payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/products/${id}`, payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    search: '',
    statusFilter: '',
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setSearch, setStatusFilter } = productSlice.actions;
export default productSlice.reducer;
