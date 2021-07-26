import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    myID: '',
    roomID: '',
    question: {},
    rankings: [],
    count: 10,
    status: 4,
    inParty: false
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setMyID: (state, action) => {
            state.myID = action.payload
        },
        setRoomID: (state, action) => {
            state.roomID = action.payload
        },
        setQuestion: (state, action) => {
            state.question = action.payload
        },
        setRankings: (state, action) => {
            state.rankings = action.payload
        },
        setCount: (state, action) => {
            state.count = action.payload
        },
        setStatus: (state, action) => {
            state.status = action.payload
        },
        setInParty: (state, action) => {
            state.inParty = action.payload
        },
        ResetState: (state) => {
            state.question = {};
            state.roomID = state.inParty ? state.roomID : "";
            state.status = 4;
            state.rankings = [];
        },
    },
})

export const { setMyID, setRoomID, setQuestion, setRankings, setCount, setStatus, setInParty, ResetState } = gameSlice.actions

export default gameSlice.reducer