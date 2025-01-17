import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchSearchChats = createAsyncThunk('chat/fetchSearchChats', async ({userId, theKeyword}) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/findChat/${userId}/${theKeyword}`)
    return response.data.chatSearchRes
})
const initState = {
    chats: [],
    status: 'loading'
}

const fetchChatsSlice = createSlice({
    name: 'chats',
    initialState: initState,
    reducers: {
        fetchChats: (state, action) => {
            state.status = 'succeeded'
            state.chats = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchSearchChats.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchSearchChats.fulfilled, (state, action) => {
            state.status = 'succeeded'
            state.chats = action.payload
        })
        .addCase(fetchSearchChats.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const userChats = (state) => state.chats.chats
export const chatStatus = (state) => state.chats.status
export const { fetchChats } = fetchChatsSlice.actions
export default fetchChatsSlice.reducer