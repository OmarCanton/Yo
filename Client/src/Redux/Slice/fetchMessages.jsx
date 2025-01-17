// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import axios from 'axios'

// const groupMessagesByDate = (messages) => {
//     const grouped = {}
//     const today = new Date()
//     const yesterday = new Date()
//     yesterday.setDate(today.getDate() - 1)
    
//     messages.forEach(msg => {
//         const date = new Date(msg.createdAt)
//         let dateKey
//         if(date.toDateString() === today.toDateString()) {
//             dateKey = 'Today'
//         } else if(date.toDateString() === yesterday.toDateString()) {
//             dateKey = 'Yesterday'
//         } else {
//             dateKey = date.toDateString()
//         }
//         if(!grouped[dateKey]) {
//             grouped[dateKey] = []
//         }
//         grouped[dateKey].push(msg)
//     })
//     return grouped
// }


// export const fetchMessage = createAsyncThunk('message/fetchMessage', async (chatId) => {
//     const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/fetchMessages/${chatId}`)
//     return groupMessagesByDate(response.data.messages)
// })

// const initState = {
//     messages: [],
//     status: 'idle'
// }

// const fetchMessageSlice = createSlice({
//     name: 'message',
//     initialState: initState,
//     extraReducers: (builder) => {
//         builder
//         .addCase(fetchMessage.pending, (state) => {
//             state.status = 'loading'
//         })
//         .addCase(fetchMessage.fulfilled, (state, action) => {
//             state.status = 'succeeded'
//             state.messages = action.payload
//         })
//         .addCase(fetchMessage.rejected, (state) => {
//             state.status = 'failed'
//         })
//     }
// })

// export const userMessages = (state) => state.message.messages
// export const messageFetchStat = (state) => state.message.status


// export default fetchMessageSlice.reducer