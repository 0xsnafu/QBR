import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './game'
import userReducer from './user'
import flashReducer from './flash'

export const store = configureStore({
    reducer: {
        game: gameReducer,
        user: userReducer,
        flash: flashReducer
    },
})