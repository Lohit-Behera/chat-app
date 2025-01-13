import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "@/lib/proxy";

// type
type Message = {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: Date;
};

type Messages = {
  docs: Message[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
};

export const fetchGetMessages = createAsyncThunk(
  "message/getMessages",
  async (receiverId: string, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const { data } = await axios.get(
        `${baseUrl}/api/v1/messages/get/${receiverId}`,
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

const messageSlice = createSlice({
  name: "message",
  initialState: {
    getMessage: { data: {} as Messages },
    getMessageStatus: "idle",
    getMessageError: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetMessages.pending, (state) => {
        state.getMessageStatus = "loading";
      })
      .addCase(fetchGetMessages.fulfilled, (state, action) => {
        state.getMessageStatus = "succeeded";
        state.getMessage = action.payload;
      })
      .addCase(fetchGetMessages.rejected, (state, action) => {
        state.getMessageStatus = "failed";
        state.getMessageError = action.payload || "Failed to get messages";
      });
  },
});

export default messageSlice.reducer;
