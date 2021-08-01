import axios from 'axios';

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {}
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload
        },
        logoutUser: (state, action) => {
            state.user = action.payload;

            axios.post('/logout')
                .then(res => {
                    localStorage.removeItem('jwt');
                })
                .catch(err => console.log(err))
        }
    }
})

export const { setUser, logoutUser } = userSlice.actions

export default userSlice.reducer