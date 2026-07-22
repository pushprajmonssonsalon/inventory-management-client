import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async ({ page = 1, limit = 20, type, dateFrom, dateTo } = {}, thunkAPI) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get('/transactions', { params });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to load transactions'
      );
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    typeFilter: '',
    dateFrom: '',
    dateTo: '',
    status: 'idle',
    error: null,
  },
  reducers: {
    setTypeFilter(state, action) {
      state.typeFilter = action.payload;
    },
    setDateFrom(state, action) {
      state.dateFrom = action.payload;
    },
    setDateTo(state, action) {
      state.dateTo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setTypeFilter, setDateFrom, setDateTo } = transactionSlice.actions;
export default transactionSlice.reducer;
