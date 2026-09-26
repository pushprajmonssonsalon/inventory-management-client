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

export const fetchTransactionsSummary = createAsyncThunk(
  'transactions/fetchSummary',
  async ({ dateFrom, dateTo } = {}, thunkAPI) => {
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get('/transactions/summary', { params });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to load transaction summary'
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
    summary: { stockIn: 0, stockOut: 0, customerReturn: 0, supplierReturn: 0, damagedReturn: 0, totalReturns: 0 },
    summaryStatus: 'idle',
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
      })
      .addCase(fetchTransactionsSummary.pending, (state) => {
        state.summaryStatus = 'loading';
      })
      .addCase(fetchTransactionsSummary.fulfilled, (state, action) => {
        state.summaryStatus = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchTransactionsSummary.rejected, (state) => {
        state.summaryStatus = 'failed';
      });
  },
});

export const { setTypeFilter, setDateFrom, setDateTo } = transactionSlice.actions;
export default transactionSlice.reducer;
