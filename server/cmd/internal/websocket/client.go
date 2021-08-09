package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/handlers"

	"github.com/MartyMav/QBRServer/cmd/internal/database"
	"github.com/MartyMav/QBRServer/cmd/internal/models"
	"github.com/golang-jwt/jwt"

	"github.com/gorilla/websocket"
)

const (
	maxMessageSize = 1024
) // Maximum message size allowed from peer.

type Client struct {
	ID                  string `json:"id"`
	Username            string `json:"username"`
	ElapsedTime         string `json:"elapsedTime"`
	IsHost              bool   `json:"isHost"`
	InParty             bool   `json:"inParty"`
	Score               int    `json:"score"`
	MyQuestion          string `json:"myQuestion"`
	MyAnswer            int    `json:"myAnswer"`
	QuestionIndex       int    `json:"questionIndex"`
	IsABot              bool
	IsThinking          bool
	MinimumDelay        int
	MaximumDelay        int
	AnswerDelay         int
	AnswerDelayProgress int
	JWTToken            string
	DBID                uint
	Conn                *websocket.Conn
	Room                *Room
	Send                chan []byte
}

func CreateNewUser(conn *websocket.Conn) *Client {
	return &Client{
		ID:       GenerateClientID(),
		Username: GenerateUsername(),
		IsHost:   false,
		InParty:  false,
		Score:    0,
		IsABot:   false,
		Conn:     conn,
		Room:     nil,
		Send:     make(chan []byte, 100),
	}
}

func GenerateUsername() string {
	usernameColors := [5]string{"Red", "Blue", "Green", "Purple", "Pink"}
	usernameAnimals := [5]string{"Dog", "Cat", "Mosquito", "Dragon", "Donkey"}

	return usernameColors[rand.Intn(len(usernameColors))] + " " + usernameAnimals[rand.Intn(len(usernameAnimals))]
}

func GenerateClientID() string {
	letters := [9]string{"A", "B", "C", "D", "E", "0", "1", "2", "3"}

	clientID := ""

	for i := 1; i < 9; i++ {
		clientID += letters[rand.Intn(len(letters))]
	}
	return clientID
}

//Returns a minimized client list, so no unnecessary data gets sent to Client
func GetClientList(room *Room) []string {
	clientList := make([]string, 0)

	for client := range room.Clients {
		b, err := json.Marshal(struct {
			ID          string `json:"id"`
			Username    string `json:"username"`
			ElapsedTime string `json:"elapsedTime"`
			IsHost      bool   `json:"isHost"`
			Score       int    `json:"score"`
		}{
			ID:          client.ID,
			Username:    client.Username,
			ElapsedTime: client.ElapsedTime,
			IsHost:      client.IsHost,
			Score:       client.Score,
		})
		if err != nil {
			fmt.Println(err)
		}

		clientList = append(clientList, string(b))
	}

	return clientList
}

func (client *Client) JoinRoom(roomID string) {

	//Search for open room; if none are open, create new room
	room := client.SearchForOpenRoom(roomID)
	go room.Start()

	//New Room was created
	if len(room.Clients) == 0 {

		if !client.InParty {
			go room.StartPreGame()
		} else {
			client.IsHost = true //Host only necessary in party
		}
	}

	//Connect to new room
	room.Register <- client
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.Room.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	for {
		_, p, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var message Message
		json.Unmarshal([]byte(string(p)), &message)

		switch message.Status {
		case 5: //Get Question
			question := c.Room.QuestionBank[0]

			b, err := json.Marshal(question)
			if err != nil {
				fmt.Println(err)
			}

			c.MyQuestion = question.Message
			c.MyAnswer = question.Answer
			c.QuestionIndex = question.Index

			c.Send <- c.Room.GenerateMessage(5, []string{string(b)})

		case 6: //Check Answer
			if message.Body[0] == fmt.Sprint(c.MyAnswer) {
				c.Score++

				//Client just answered the last question in the bank
				if c.QuestionIndex == len(c.Room.QuestionBank) {

					c.QuestionIndex++

					//Set Elapsed Time - how long client took
					t := time.Now()
					elapsed := t.Sub(c.Room.StartTime)
					c.ElapsedTime = elapsed.Truncate(time.Millisecond).String()

					//Adds Client to end of ranking list
					c.Room.Rankings = append(c.Room.Rankings, c.ID)

					c.Room.Broadcast <- c.Room.GenerateMessage(8, c.Room.Rankings)

					//Only proceeds if there is a token(logged in), and is verified(wont have token unless verified)
					if len(c.JWTToken) == 0 {
						continue
					} else {
						//If there is a JWT, save results to DB for player
						var isWinner bool
						if c.Room.Rankings[0] == c.ID {
							isWinner = true
						}
						handlers.SaveMatchResults(isWinner, c.DBID)
					}

				} else if c.QuestionIndex < len(c.Room.QuestionBank) { //Still questions left...

					question := c.Room.QuestionBank[c.QuestionIndex]

					b, err := json.Marshal(question)
					if err != nil {
						fmt.Println(err)
					}

					c.MyQuestion = question.Message
					c.MyAnswer = question.Answer
					c.QuestionIndex = question.Index

					c.Send <- c.Room.GenerateMessage(5, []string{string(b)})
				}

				c.Room.Broadcast <- c.Room.GenerateMessage(2, nil) //Send client list to single client
			}
		case 7: //Play Again - single player
			c.Room.Unregister <- c

			if c.InParty {
				// c.JoinRoom(c.Room.ID)
				fmt.Println("In Play Again but InParty")
			} else {
				c.JoinRoom("")
			}

		case 11: //Party Play
			if c.Score > 0 && c.ElapsedTime != "" {

				for client := range c.Room.Clients {
					client.Score = 0
					client.ElapsedTime = ""
				}

				c.Room.Broadcast <- c.Room.GenerateMessage(2, nil) //Send client list to single client

			}
			if c.IsHost {
				go c.Room.StartPreGame()
			}
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	defer func() {
		c.Conn.Close()
	}()
	for {
		message, ok := <-c.Send
		if !ok {
			// The room closed the channel.
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}

		w, err := c.Conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}

		w.Write(message)

		if err := w.Close(); err != nil {
			fmt.Println("ERR IN WRITEPUMP, CLOSING")
			return
		}

	}
}

func ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := Upgrade(w, r)
	if err != nil {
		fmt.Fprintf(w, "%+v\n", err)
		return
	}

	client := CreateNewUser(conn)

	cookie, err := r.Cookie("jwt")
	if err == nil { //No error; There was a cookie(logged in)
		token, err := handlers.ParseToken(cookie.Value)
		if err != nil {
			fmt.Println(err)
			return
		}

		claims := token.Claims.(*jwt.StandardClaims)

		var user models.User
		database.DB.Where("id = ?", claims.Issuer).First(&user)

		if user.IsVerified {
			//Will only use username if user actually set one
			if len(user.Username) > 0 {
				client.Username = user.Username
			}

			client.JWTToken = cookie.Value
			client.DBID = user.Id
		}
	}

	params := r.URL.Query()

	inParty, err := strconv.ParseBool(params.Get("inParty"))
	if err != nil {
		fmt.Println("Error: Can't parse inParty param in URL")
	}

	roomID := params.Get("roomID")
	if inParty {
		client.InParty = true
	}

	client.JoinRoom(roomID)

	go client.writePump()
	go client.readPump()
}
