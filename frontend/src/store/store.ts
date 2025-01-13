import { configureStore } from "@reduxjs/toolkit";
import userSlice from "@/features/userSlice";
import messageSlice from "@/features/messageSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
