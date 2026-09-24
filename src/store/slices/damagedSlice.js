import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDamagedProducts = createAsyncThunk(
  'damaged/fetch',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/damaged');
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to load damaged products');
    }
  }
);

const damagedSlice = createSlice({
  name: 'damaged',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDamagedProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDamagedProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDamagedProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default damagedSlice.reducer;
