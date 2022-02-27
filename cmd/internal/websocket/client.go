package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/MartyMav/QBR/cmd/internal/handlers"

	"github.com/MartyMav/QBR/cmd/internal/database"
	"github.com/MartyMav/QBR/cmd/internal/models"
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
	var usernameColors = strings.Split(os.Getenv("USERNAME_COLORS"), ",")
	var usernameAnimals = strings.Split(os.Getenv("USERNAME_ANIMALS"), ",")

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

		ReadMessage(message, c)

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

	params := r.URL.Query()

	client := CreateNewUser(conn)

	if handlers.IsAuthorized(params.Get("token")) { //There was a token in Header(logged in)
		token, err := handlers.ParseToken(params.Get("token"))
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

			client.JWTToken = params.Get("token")
			client.DBID = user.Id
		}
	}

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
