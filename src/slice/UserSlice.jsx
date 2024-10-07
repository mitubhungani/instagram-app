// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import toast from "react-hot-toast";
// // import { toast } from "react-toastify";

// export const getUser = createAsyncThunk("/getUser", async () => {
//   try {
//     let res = await axios.get(`http://localhost:3000/user`);
//     return res.data;
//   } catch (error) {
//     console.log(error);
//   }
// });

// export const createUser = createAsyncThunk(
//   "/createUser",
//   async (user, { rejectWithValue }) => {
//     try {
//       // Check if the user already exists
//       let existingUsers = await axios.get(`http://localhost:3000/user`);
//       let userExists = existingUsers.data.some(
//         (ele) => ele.username === user.username && ele.email === user.email
//       );

//       if (userExists) {
//         return rejectWithValue("User already exists");
//       }

//       // Create a new user if not exists
//       let res = await axios.post(`http://localhost:3000/user`, user);
//       localStorage.setItem("user", JSON.stringify(res.data));
//       toast.success("Signup Successfully");
//       return res.data;
//     } catch (error) {
//       console.error("Failed to create user:", error);
//       throw error;
//     }
//   }
// );

// export const loginUser = createAsyncThunk("/loginUser", async () => {
//   try {
//     let res = await axios.get(`http://localhost:3000/user`);
//     let data = res.data.filter(
//       (ele) => ele.username === user.username && ele.password === user.password
//     );
//     if (data.length === 0) {
//       toast.error("User not found");
//       return;
//     }
//     localStorage.setItem("user", JSON.stringify(data));
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// });

// export const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     users: [],
//     user: JSON.parse(localStorage.getItem("user")) || {},
//     isLogin: false,
//   },
//   reducers: {
//     logout: (state) => {
//       state.user = {};
//       state.isLogin = false;
//       localStorage.removeItem("user");
//     },
//   },
//   extraReducers: (builder) => {
//     // Create User
//     builder.addCase(createUser.pending, (state) => {
//       state.isLogin = false;
//     });
//     builder.addCase(createUser.fulfilled, (state, action) => {
//       state.users.push(action.payload);
//       state.isLogin = true;
//     });

//     // builder.addCase(createUser.rejected, (state) => {
//     //   state.isLogin = false;
//     // });

//     builder.addCase(createUser.rejected, (state, action) => {
//       state.isLogin = false;
//       if (action.payload === "User already exists") {
//         toast.error("User already exists");
//       } else {
//         toast.error("Failed to create user");
//       }
//     });

//     // Get User
//     builder.addCase(getUser.pending, (state) => {
//       state.isLogin = false;
//     });
//     builder.addCase(getUser.fulfilled, (state, action) => {
//       state.users = action.payload;
//     });
//     builder.addCase(getUser.rejected, (state) => {
//       state.isLogin = false;
//     });

//     // Login User
//     builder.addCase(loginUser.fulfilled, (state, action) => {
//       if (action.payload.length > 0) {
//         state.user = action.payload[0];
//         toast.success("Loginn Successful");
//         state.isLogin = true;
//       } else {
//         // This code block should never be reached due to earlier validation
//         toast.error("User not found");
//         state.isLogin = false;
//       }
//     });
//     builder.addCase(loginUser.rejected, (state) => {
//       alert("Login failed");
//       state.isLogin = false;
//     });
//   },
// });

// export const { logout } = userSlice.actions;
// export const userReducer = userSlice.reducer;





import { createSlice } from "@reduxjs/toolkit";

// User slice
export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || {},
    isLogin: false,
  },
  reducers: {
    logout: (state) => {
      state.user = {};
      state.isLogin = false;
      localStorage.removeItem("user");
    },
  },
});

export const { logout } = userSlice.actions;
export const userReducer = userSlice.reducer;
