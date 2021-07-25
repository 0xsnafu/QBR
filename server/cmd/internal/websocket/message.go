package websocket

import (
	"encoding/json"
	"fmt"
)

type Message struct {
	Status int      `json:"status"`
	Body   []string `json:"body"`
}

func (room *Room) GenerateMessage(status int, data []string) []byte {

	var message = Message{
		Status: status,
	}

	if status == 2 {
		message.Body = GetClientList(room)
	} else {
		message.Body = data
	}

	b, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
	}

	return b
}
