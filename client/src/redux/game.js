import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    myID: '',
    roomID: '',
    userList: [],
    question: {},
    rankings: [],
    count: 10,
    status: 4,
    inParty: false,
    isHost: false,
    isWinner: false
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
        setUserList: (state, action) => {
            state.userList = action.payload
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
        setIsHost: (state, action) => {
            state.isHost = action.payload
        },
        setIsWinner: (state, action) => {
            state.isWinner = action.payload
        },
        ResetState: (state) => {
            state.question = {};
            state.roomID = state.inParty ? state.roomID : "";
            state.rankings = [];
            state.status = 4;
            state.userList = state.inParty ? state.userList : [];
        },
    },
})

export const { setMyID, setRoomID, setUserList, setQuestion, setRankings, setCount, setStatus, setInParty, setIsHost, setIsWinner, ResetState } = gameSlice.actions

export default gameSlice.reducer