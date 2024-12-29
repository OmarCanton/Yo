import { createSlice, createAsyncThunk } from '@reduxjs/toolkit' 
import axios from 'axios'

export const fetchPicture = createAsyncThunk('profilePhoto/fetchPicture', async (id) => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getProfilePhoto/${id}`, {withCredentials: true})
    return response.data
})

const initState = {
    photo: '',
    loading: false,
    status: 'loading'
}

const getProfilePhotoSlice = createSlice({
    name: 'profilePhoto',
    initialState: initState,
    extraReducers: (builder) => {
        builder
        .addCase(fetchPicture.pending, (state) => {
            state.loading = true
            state.status = 'loading'
        })
        .addCase(fetchPicture.fulfilled, (state, action) => {
            state.loading = false
            state.photo = action.payload.profile
            state.status = 'success'
        })
        .addCase(fetchPicture.rejected, (state) => {
            state.photo = ''
            state.loading = false
            state.status = 'rejected'
        })
    }
})

export const profilePicture = (state) => state.profilePhoto.photo
export const loading = (state) => state.profilePhoto.loading
export const status = (state) => state.profilePhoto.status

export default getProfilePhotoSlice.reducer