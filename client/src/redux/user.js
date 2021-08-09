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
            localStorage.removeItem('jwt');

            axios.post('/logout')
                .then(res => {
                    // localStorage.removeItem('jwt');
                })
                .catch(err => console.log(err))
        }
    },
    extraReducers: (builder) => {
        builder.addCase(updateUser.fulfilled, (state, { payload }) => {
            state.user.username = payload.username;
            state.user.gamesPlayed = payload.gamesPlayed;
            state.user.gamesWon = payload.gamesWon;
            state.user.isVerified = payload.isVerified;

            localStorage.setItem('jwt', document.cookie.match("(^|;)\\s*jwt\\s*=\\s*([^;]+)")?.pop() || "");
        })
    },
})

export const { setUser, logoutUser } = userSlice.actions

export default userSlice.reducer