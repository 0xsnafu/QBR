package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/websocket"
	"github.com/joho/godotenv"
)

const portNumber = ":5000"

var app config.AppConfig

func setupRoutes() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(w, r)
	})
	http.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		params := r.URL.Query()

		wasRoomFound := false
		for room := range websocket.Rooms {
			if room.ID == params.Get("roomID") {
				wasRoomFound = true

				if len(room.Clients) == room.MaxClients {
					w.WriteHeader(http.StatusNotAcceptable)
				} else {
					w.WriteHeader(http.StatusOK)
				}

				r.Body.Close()
			}
		}

		if !wasRoomFound {
			w.WriteHeader(http.StatusNotFound)
		}
	})

}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	rand.Seed(time.Now().UnixNano())

	// change this to true when in production
	app.InProduction = false

	websocket.Rooms = make(map[*websocket.Room]bool)

	setupRoutes()

	fmt.Println("Starting Quick Brain Racers Server on port " + portNumber)

	http.ListenAndServe("localhost"+portNumber, nil)

}
