package websocket

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"
)

var Rooms map[*Room]bool

type Room struct {
	ID             string
	MaxClients     int
	GameType       string
	Cards          []Card
	QuestionBank   []Question
	Rankings       []string
	GameHasStarted bool
	IsJoinable     bool
	IsPrivate      bool
	StartTime      time.Time
	Register       chan *Client
	Unregister     chan *Client
	Clients        map[*Client]bool
	Broadcast      chan []byte
}

func generateRoomID() string {
	letters := [5]string{"A", "B", "C", "D", "E"}
	rand.Seed(time.Now().UnixNano())

	return letters[rand.Intn(len(letters))] + letters[rand.Intn(len(letters))] + letters[rand.Intn(len(letters))]
}

func NewRoom(isPrivate bool) *Room {
	gameTypes := strings.Split(os.Getenv("GAME_TYPES"), ",")
	gameType := gameTypes[rand.Intn(len(gameTypes))] //Picks a Game Type at random

	return &Room{
		ID:             generateRoomID(),
		MaxClients:     4,
		GameType:       gameType,
		QuestionBank:   GenerateQuestionBank(),
		Rankings:       make([]string, 0),
		GameHasStarted: false,
		IsJoinable:     true,
		IsPrivate:      isPrivate,
		Register:       make(chan *Client),
		Unregister:     make(chan *Client),
		Clients:        make(map[*Client]bool),
		Broadcast:      make(chan []byte),
	}
}

//Returns a room that the client is not currently in, and has space left
func (client *Client) SearchForOpenRoom(roomID string) *Room {

	//Client is in Party Play, blank ID means create new private room
	if client.InParty && roomID == "" {
		return NewRoom(true)
	}

	var foundRoom *Room

	for room := range Rooms {

		//Looking for specific Room
		if roomID == room.ID {
			if room.IsJoinable && len(room.Clients) < room.MaxClients {
				foundRoom = room
				break
			}
		}

		//If there is space left in this room, and not looking for specific room
		if !room.IsPrivate && room.IsJoinable && room != client.Room && len(room.Clients) < room.MaxClients {
			foundRoom = room
			break
		}

	}

	//If a Room was found
	if foundRoom != nil && len(foundRoom.Clients) > 0 {
		//Check if the joining Client fills the Room
		if len(foundRoom.Clients)+1 == foundRoom.MaxClients {
			fmt.Println("room is full now..")
			foundRoom.IsJoinable = false
		}

		return foundRoom
	}

	return NewRoom(false) //Creates new room if all rooms are full, or there are no rooms :(
}

//Message Types: 0 -> Counting Down, 1 -> Start Match, 2 -> Send Client, 3 -> Send ID, 4 -> Searching... , 5 -> Get Question
func (room *Room) Start() {
	Rooms[room] = true

	for {
		select {
		case client := <-room.Register:
			room.Clients[client] = true

			client.Room = room
			client.Score = 0
			client.ElapsedTime = ""

			if client.IsABot {
				return
			}

			client.Send <- room.GenerateMessage(3, []string{client.ID})     //Send client it's ID
			client.Send <- room.GenerateMessage(6, []string{room.GameType}) //Send client Game Type

			if client.InParty {
				client.Send <- room.GenerateMessage(10, []string{client.Room.ID}) //Send client it's Room ID
			}

			//Broadcasting to single connection messes everything up for some reason...
			if len(room.Clients) == 1 {
				client.Send <- room.GenerateMessage(2, nil) //Send client list to single client
			} else {
				room.Broadcast <- room.GenerateMessage(2, nil) //Broadcast client list
			}

		case client := <-room.Unregister:
			if _, ok := room.Clients[client]; ok {
				delete(room.Clients, client)

				client.InParty = false

				//If last client disconnected, delete room. Else, update other clients
				if len(room.Clients) == 0 || (len(room.Clients) > 0 && !room.CheckForClients()) {
					delete(Rooms, room)
				} else {

					//Dont want people joining mid game
					if !room.GameHasStarted || client.InParty {
						room.IsJoinable = true
					}

					//If disconnecting client was Host, selects another host
					if client.IsHost {
						for subClient := range room.Clients {
							subClient.IsHost = true
							break
						}
						client.IsHost = false
					}

					room.Broadcast <- room.GenerateMessage(2, nil) //Broadcast client list

				}
			}

		case message := <-room.Broadcast:
			if len(room.Clients) == 0 {
				return
			}

			for client := range room.Clients {
				if client.IsABot { //No need to broadcast to a bot
					continue
				}
				select {
				case client.Send <- message:
				default:
					if !client.IsABot {
						close(client.Send)
					}
					delete(room.Clients, client)
				}
			}
		}
	}

}

func (room *Room) StartPreGame() {
	ticker := time.NewTicker(1 * time.Second)
	done := make(chan bool)

	secondsLeft, err := strconv.Atoi(os.Getenv("TIME_TO_MATCH_STARTS"))
	if err != nil {
		log.Fatal("Error loading TIME_TO_MATCH_STARTS from .env file")
	}
	timeToShowCountdown, err := strconv.Atoi(os.Getenv("TIME_TO_SHOW_COUNTDOWN"))
	if err != nil {
		log.Fatal("Error loading TIME_TO_SHOW_COUNTDOWN from .env file")
	}

	//Resetting Room state
	room.Rankings = nil
	room.GameHasStarted = false

	if room.GameType == "Math" {
		room.QuestionBank = GenerateQuestionBank()
	} else if room.GameType == "Memory" {
		room.Cards = GenerateCards()
	}

	if room.IsPrivate {
		secondsLeft = timeToShowCountdown
	} else {
		room.Broadcast <- room.GenerateMessage(4, nil)
	}

	go func() {
		for {
			select {
			case <-done:
				fmt.Println("done?")
				return
			case <-ticker.C:

				//For now, a private room is a party room
				if !room.IsPrivate {
					if secondsLeft == timeToShowCountdown && len(room.Clients) != room.MaxClients {
						room.IsJoinable = false //No more human players; remainder will be bots

						for i := len(room.Clients); i < room.MaxClients; i++ {
							if len(room.Clients) == room.MaxClients { //User somehow joined last second
								break
							}

							botUser := room.GenerateBot()

							room.Clients[botUser] = true
						}

						room.Broadcast <- room.GenerateMessage(2, nil) //Broadcast client list
					}
				} //TAKING BOTS OUT FOR MEMORY GAME DEV

				//Room should be full with bots or players by this point...
				if secondsLeft <= timeToShowCountdown {
					room.Broadcast <- room.GenerateMessage(0, []string{fmt.Sprint(secondsLeft)})
				}

				//Start Match!
				if secondsLeft == 0 {
					room.Broadcast <- room.GenerateMessage(1, nil)

					room.IsJoinable = false
					room.StartTime = time.Now()
					room.GameHasStarted = true
					go room.ManageBots()

					ticker.Stop()
					done <- true
				}

				secondsLeft--
			}
		}
	}()
}

func (room *Room) ManageBots() {
	millisecondCount := 100

	ticker := time.NewTicker(time.Duration(millisecondCount) * time.Millisecond)
	done := make(chan bool)

	go func() {
		for {
			select {
			case <-done:
				fmt.Println("ManageBots - done?")
				return
			case <-ticker.C:

				for bot := range room.Clients {
					//Skip iteration if is not a bot, or this bot is in Rankings(bot is finished match)
					if !bot.IsABot || IncludesID(room.Rankings, bot.ID) {
						continue
					}

					if bot.AnswerDelay == 0 { //Starting, or just answered a question(either right or wrong). Set delay for the next question
						bot.AnswerDelay = rand.Intn(bot.MaximumDelay-bot.MinimumDelay) + bot.MinimumDelay
					} else {
						bot.AnswerDelayProgress += millisecondCount

						//Bot has waited enough time...
						if bot.AnswerDelayProgress >= bot.AnswerDelay {

							rightOrWrong := rand.Intn(4)

							//0 = Incorrect. 1,2,3 means bot answered correctly
							switch rightOrWrong {
							case 0:
								bot.AnswerDelay = 0
								bot.AnswerDelayProgress = 0
							case 1, 2, 3:
								bot.Score++
								bot.AnswerDelay = 0
								bot.AnswerDelayProgress = 0

								if room.GameType == "Math" {
									bot.QuestionIndex++
								}
							}

							//Bot finished
							if room.GameType == "Math" {
								if bot.QuestionIndex > len(room.QuestionBank) {
									t := time.Now()
									elapsed := t.Sub(room.StartTime)
									bot.ElapsedTime = elapsed.Truncate(time.Millisecond).String()

									room.Rankings = append(room.Rankings, bot.ID)
									room.Broadcast <- room.GenerateMessage(8, room.Rankings)
								}
							} else if room.GameType == "Memory" {

								if bot.Score >= len(room.Cards)/2 {
									t := time.Now()
									elapsed := t.Sub(room.StartTime)
									bot.ElapsedTime = elapsed.Truncate(time.Millisecond).String()

									room.Rankings = append(room.Rankings, bot.ID)
									room.Broadcast <- room.GenerateMessage(8, room.Rankings)
								}
							}

							room.Broadcast <- room.GenerateMessage(2, nil) //Send client list to ALL
						}
					}
				}

				//Stop ticker if there are no human clients left(only bots in room)
				if !room.CheckForClients() {
					ticker.Stop()
				}
			}
		}
	}()

}

//Iterates through all clients in the Room, determines if there are any non bot clients left
func (room *Room) CheckForClients() bool {
	isThereAClient := false

	for client := range room.Clients {
		if !client.IsABot {
			isThereAClient = true
			break
		}
	}

	return isThereAClient
}

//Checks if specific ID is in the array
func IncludesID(arr []string, soughtID string) bool {
	for _, id := range arr {
		if soughtID == id {
			return true
		}
	}

	return false
}
