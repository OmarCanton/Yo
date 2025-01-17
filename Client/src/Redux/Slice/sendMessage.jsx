// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// export const sendMessage = createAsyncThunk('sendMsg/sendMessage', async ({chatId, userId, content}) => {
//     const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/sendMessage/${chatId}`, { senderId: userId, content })
//     return response.data
// })

// const initState = {
//     status: 'idle'
// }

// const sendMessageSlice = createSlice({
//     name: 'sendMsg',
//     initialState: initState,
//     extraReducers: (builder) => {
//         builder
//         .addCase(sendMessage.pending, (state) => {
//             state.status = 'sending'
//         })
//         .addCase(sendMessage.fulfilled, (state) => {
//             state.status = 'sent'
//         })
//         .addCase(sendMessage.rejected, (state) => {
//             state.status = 'failed'
//         })
//     }
// })

// export const { sendLiveMessage } = sendMessageSlice.actions
// export default sendMessageSlice.reducer