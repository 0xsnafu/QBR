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

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	rand.Seed(time.Now().UnixNano())

	app.InProduction = false

	websocket.Rooms = make(map[*websocket.Room]bool)

	fmt.Println("Starting Quick Brain Racers Server on port " + portNumber)

	srv := &http.Server{
		Addr:    "localhost" + portNumber,
		Handler: routes(&app),
	}

	err = srv.ListenAndServe()
	log.Fatal(err)
}
