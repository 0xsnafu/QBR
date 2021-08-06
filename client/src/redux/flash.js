import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';

const initialState = {}

export const flashSlice = createSlice({
    name: 'flash',
    initialState,
    reducers: {
        addFlashMsg: (state, { payload }) => {
            toast[payload.type](payload.msg)
        },
    },
})

export const { addFlashMsg } = flashSlice.actions

export default flashSlice.reducer