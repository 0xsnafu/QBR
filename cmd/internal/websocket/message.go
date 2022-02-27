package websocket

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/MartyMav/QBR/cmd/internal/handlers"
)

type Message struct {
	Status int      `json:"status"`
	Body   []string `json:"body"`
}

func (room *Room) GenerateMessage(status int, data []string) []byte {

	var message = Message{
		Status: status,
	}

	if status == 2 { //nil means no specific request, so send entire client list
		message.Body = GetClientList(room)
	} else if status == 7 { //Send only score data
		scores := make([]string, len(room.Clients))
		index := 0

		for client := range room.Clients {
			scores[index] = strconv.Itoa(client.Score)
			index++
		}
		message.Body = scores
	} else {
		message.Body = data
	}

	b, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
	}

	return b
}

//Check if a JWT exists. If it does, save data to DB
func AttempSaveToDB(client *Client) {
	if len(client.JWTToken) > 0 {
		var isWinner bool
		if client.Room.Rankings[0] == client.ID {
			isWinner = true
		}
		handlers.SaveMatchResults(isWinner, client.DBID)
	}
}

//Calculate how long client took to finish game
func SetElapsedTime(client *Client) {
	t := time.Now()
	elapsed := t.Sub(client.Room.StartTime)
	client.ElapsedTime = elapsed.Truncate(time.Millisecond).String()
}

func CheckIfDoneMatch(gameType string, client *Client) bool {

	switch gameType {
	case "Math":
		if client.QuestionIndex == len(client.Room.QuestionBank) {
			return true
		}
	case "Memory":
		if client.Score == len(client.Room.Cards)/2 {
			return true
		}
	}
	return false
}

func ReadMessage(message Message, client *Client) {

	switch message.Status {
	case 3: //Check Pair of Cards

		firstCardIndex, _ := strconv.Atoi(message.Body[0])
		secondCardIndex, _ := strconv.Atoi(message.Body[1])

		if client.Room.Cards[firstCardIndex].Color == client.Room.Cards[secondCardIndex].Color {
			client.Score++

			//Client matched all pairs
			if CheckIfDoneMatch(client.Room.GameType, client) {

				SetElapsedTime(client)

				//Adds Client to end of ranking list
				client.Room.Rankings = append(client.Room.Rankings, client.ID)

				client.Room.Broadcast <- client.Room.GenerateMessage(8, client.Room.Rankings)

				client.Room.Broadcast <- client.Room.GenerateMessage(7, nil)

				AttempSaveToDB(client)

			} else {
				client.Room.Broadcast <- client.Room.GenerateMessage(7, nil)
			}
		}

	case 4: //Get Cards

		b, err := json.Marshal(client.Room.Cards)
		if err != nil {
			fmt.Println(err)
		}

		client.Send <- client.Room.GenerateMessage(5, []string{string(b)})

	case 5: //Get Question
		question := client.Room.QuestionBank[0]

		b, err := json.Marshal(question)
		if err != nil {
			fmt.Println(err)
		}

		client.MyQuestion = question.Message
		client.MyAnswer = question.Answer
		client.QuestionIndex = question.Index

		client.Send <- client.Room.GenerateMessage(5, []string{string(b)})

	case 6: //Check Math Answer
		if message.Body[0] == fmt.Sprint(client.MyAnswer) {
			client.Score++

			//Client just answered the last question in the bank
			if CheckIfDoneMatch(client.Room.GameType, client) {

				client.QuestionIndex++

				SetElapsedTime(client)

				//Adds Client to end of ranking list
				client.Room.Rankings = append(client.Room.Rankings, client.ID)

				client.Room.Broadcast <- client.Room.GenerateMessage(8, client.Room.Rankings)
				client.Room.Broadcast <- client.Room.GenerateMessage(7, nil)

				AttempSaveToDB(client)

			} else if client.QuestionIndex < len(client.Room.QuestionBank) { //Still questions left...

				question := client.Room.QuestionBank[client.QuestionIndex]

				b, err := json.Marshal(question)
				if err != nil {
					fmt.Println(err)
				}

				client.MyQuestion = question.Message
				client.MyAnswer = question.Answer
				client.QuestionIndex = question.Index

				client.Send <- client.Room.GenerateMessage(5, []string{string(b)})
				client.Room.Broadcast <- client.Room.GenerateMessage(7, nil)
			}

		}
	case 7: //Play Again - single player
		client.Room.Unregister <- client

		if client.InParty {
			// client.JoinRoom(client.Room.ID)
			fmt.Println("In Play Again but InParty")
		} else {
			client.JoinRoom("")
		}

	case 11: //Party Play
		if client.Score > 0 && client.ElapsedTime != "" {

			for client := range client.Room.Clients {
				client.Score = 0
				client.ElapsedTime = ""
			}

			client.Room.Broadcast <- client.Room.GenerateMessage(2, nil) //Send client list to single client

		}
		if client.IsHost {
			go client.Room.StartPreGame()
		}
	}
}
