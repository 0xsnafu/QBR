import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './game'
import userReducer from './user'

export const store = configureStore({
    reducer: {
        game: gameReducer,
        user: userReducer
    },
})