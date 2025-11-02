import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../plugins/axios';

// Async thunk to fetch current user
export const fetchCurrentUser = createAsyncThunk(
  'users/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch user permissions
export const fetchUserPermissions = createAsyncThunk(
  'users/fetchUserPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/user_permissions/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to check specific permission
export const checkPermission = createAsyncThunk(
  'users/checkPermission',
  async (permission, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/check_permission/?permission=${permission}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/', { params: filters });
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to fetch specific user
export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: null,
    users: [],
    permissions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.permissions = [];
    },
    clearUsers: (state) => {
      state.users = [];
      state.error = null;
    },
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        } else {
          state.users.push(action.payload);
        }
      });
  },
});

export const { clearCurrentUser, clearUsers, updateCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
