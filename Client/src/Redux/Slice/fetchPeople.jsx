import  { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchPeople = createAsyncThunk('people/fetchPeople', async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getUsers/${userId}`)
    return response.data.users
})

export const searchPeople = createAsyncThunk('people/searchPeople', async ({userId, keyword}) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/findPeople/${userId}/${keyword}`)
    return response.data.searchResult
})


const initState = {
    people: [],
    status: 'idle'
}

const fetchPeopleSlice = createSlice({
    name: 'people',
    initialState: initState,
    extraReducers: (builder) => {
        builder
        .addCase(fetchPeople.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(searchPeople.pending, (state) => {
            state.status = 'loading'
        })
        .addCase(fetchPeople.fulfilled, (state, action) => {
            state.status = 'succeeded',
            state.people = action.payload
        })
        .addCase(searchPeople.fulfilled, (state, action) => {
            state.status = 'succeeded',
            state.people = action.payload
        })
        .addCase(fetchPeople.rejected, (state) => {
            state.status = 'failed'
        })
        .addCase(searchPeople.rejected, (state) => {
            state.status = 'failed'
        })
    }
})

export const fetchedPeople = (state) => state.people.people
export const fetchedStatus = (state) => state.people.status
export default fetchPeopleSlice.reducer