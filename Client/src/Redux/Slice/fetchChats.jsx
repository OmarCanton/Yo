// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import axios from 'axios'

// export const fetchChats = createAsyncThunk('chat/fetchChats', async (userId) => {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchChats/${userId}`)
//     return response.data.chats
// })
// export const fetchSearchChats = createAsyncThunk('chat/fetchSearchChats', async ({userId, theKeyword}) => {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/findChat/${userId}/${theKeyword}`)
//     return response.data.chatSearchRes
// })

// const initState = {
//     chats: [],
//     status: 'idle'
// }

// const fetchChatsSlice = createSlice({
//     name: 'chat',
//     initialState: initState,
//     reducers: {
//         fetchUserChats: (state, action) => {
//             state.chats = action.payload
//             state.status = 'succeeded'
//             console.log('From redux', state.chats)
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//         .addCase(fetchChats.pending, (state) => {
//             state.status = 'loading'
//         })
//         .addCase(fetchSearchChats.pending, (state) => {
//             state.status = 'loading'
//         })
//         .addCase(fetchChats.fulfilled, (state, action) => {
//             state.status = 'succeeded'
//             state.chats = action.payload
//         })
//         .addCase(fetchSearchChats.fulfilled, (state, action) => {
//             state.status = 'succeeded'
//             state.chats = action.payload
//         })
//         .addCase(fetchChats.rejected, (state) => {
//             state.status = 'failed'
//         })
//         .addCase(fetchSearchChats.rejected, (state) => {
//             state.status = 'failed'
//         })
//     }
// })

// export const userChats = (state) => state.chat.chats
// export const chatFetchStatus = (state) => state.chat.status

// export const { fetchUserChats } = fetchChatsSlice.actions

// export default fetchChatsSlice.reducer