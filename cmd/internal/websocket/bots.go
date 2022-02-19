package websocket

import (
	"math/rand"
)

func (room *Room) GenerateBot() *Client {
	minDelay := 1000
	maxDelay := 3000

	//Randomly selects difficulty of bot
	switch rand.Intn(3) {
	case 0:
		minDelay = 900
		maxDelay = 1800
	case 1:
		minDelay = 700
		maxDelay = 1300
	case 2:
		minDelay = 600
		maxDelay = 1000
	}

	return &Client{
		ID:                  GenerateClientID() + "b0t",
		Username:            GenerateUsername(),
		ElapsedTime:         "",
		IsHost:              false,
		InParty:             false,
		IsABot:              true,
		IsThinking:          false,
		MinimumDelay:        minDelay,
		MaximumDelay:        maxDelay,
		AnswerDelay:         0,
		AnswerDelayProgress: 0,
		QuestionIndex:       1,
		Score:               0,
		Conn:                nil,
		Room:                room,
		Send:                nil,
	}
}
