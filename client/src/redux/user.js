import axios from 'axios';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async (thunkAPI) => {
        const response = await axios.get('/getuser')
        return response.data
    }
)

const initialState = {
    user: {}
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, { payload }) => {
            state.user = payload
        },
        logoutUser: (state, { payload }) => {
            state.user = payload;

            axios.post('/logout')
                .then(res => {
                    localStorage.removeItem('jwt');
                })
                .catch(err => console.log(err))
        }
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(updateUser.fulfilled, (state, { payload }) => {
            state.user = payload
        })
    },
})

export const { setUser, logoutUser } = userSlice.actions

export default userSlice.reducer