import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "@/lib/proxy";
import { getCookie } from "@/lib/getCookie";

type AllUser = {
  _id: string;
  fullName: string;
  username: string;
  avatar: string;
};

export const fetchRegister = createAsyncThunk(
  "auth/register",
  async (
    user: {
      username: string;
      fullName: string;
      email: string;
      password: string;
      avatar: File;
    },
    { rejectWithValue }
  ) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post(
        `${baseUrl}/api/v1/users/register`,
        user,
        config
      );
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLogin = createAsyncThunk(
  "user/login",
  async (user: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const { data } = await axios.post(
        `${baseUrl}/api/v1/users/login`,
        user,
        config
      );

      document.cookie = `userInfoChat=${encodeURIComponent(
        JSON.stringify(data.data)
      )}; path=/; max-age=${30 * 24 * 60 * 60}; secure; sameSite=None;`;
      return data.data;
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLogout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const { data } = await axios.get(
        `${baseUrl}/api/v1/users/logout`,
        config
      );
      document.cookie =
        "userInfoChat=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  "user/userDetails",
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const { data } = await axios.get(
        `${baseUrl}/api/v1/users/details`,
        config
      );

      return data;
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchGetAllUser = createAsyncThunk(
  "user/getAllUser",
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const { data } = await axios.get(`${baseUrl}/api/v1/users/all`, config);
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.message
          : error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const userInfoCookie = getCookie("userInfoChat");

export const userSlice = createSlice({
  name: "user",
  initialState: {
    register: {},
    registerStatus: "idle",
    registerError: {},

    userInfo: userInfoCookie ? JSON.parse(userInfoCookie) : null,
    userInfoStatus: "idle",
    userInfoError: {},

    logout: {},
    logoutStatus: "idle",
    logoutError: {},

    userDetails: { data: {} },
    userDetailsStatus: "idle",
    userDetailsError: {},

    getAllUser: { data: [] as AllUser[] },
    getAllUserStatus: "idle",
    getAllUserError: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegister.pending, (state) => {
        state.registerStatus = "loading";
      })
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.registerStatus = "succeeded";
        state.register = action.payload;
      })
      .addCase(fetchRegister.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.registerError = action.payload || "Failed to register user";
      })

      // Login
      .addCase(fetchLogin.pending, (state) => {
        state.userInfoStatus = "loading";
      })
      .addCase(fetchLogin.fulfilled, (state, action) => {
        state.userInfoStatus = "succeeded";
        state.userInfo = action.payload;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.userInfoStatus = "failed";
        state.userInfoError = action.payload || "Login failed";
      })

      // Logout
      .addCase(fetchLogout.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(fetchLogout.fulfilled, (state, action) => {
        state.logoutStatus = "succeeded";
        state.logout = action.payload;
        state.userInfo = null;
      })
      .addCase(fetchLogout.rejected, (state, action) => {
        state.logoutStatus = "failed";
        state.logoutError = action.payload || "Logout failed";
      })

      // User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.userDetailsStatus = "loading";
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetailsStatus = "succeeded";
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userDetailsStatus = "failed";
        state.userDetailsError = action.payload || "User Details failed";
      })

      // Get All Users
      .addCase(fetchGetAllUser.pending, (state) => {
        state.getAllUserStatus = "loading";
      })
      .addCase(fetchGetAllUser.fulfilled, (state, action) => {
        state.getAllUserStatus = "succeeded";
        state.getAllUser = action.payload;
      })
      .addCase(fetchGetAllUser.rejected, (state, action) => {
        state.getAllUserStatus = "failed";
        state.getAllUserError = action.payload || "User Details failed";
      });
  },
});

export default userSlice.reducer;
