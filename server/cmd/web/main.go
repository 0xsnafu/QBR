package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/database"

	"github.com/MartyMav/QBRServer/cmd/internal/websocket"
)

func main() {
	config.App.Setup()

	database.Connect()

	websocket.Rooms = make(map[*websocket.Room]bool)

	fmt.Println("Starting Quick Brain Racers Server on " + config.App.Address)

	srv := &http.Server{
		Addr:    config.App.Address,
		Handler: routes(),
	}

	err := srv.ListenAndServe()
	log.Fatal(err)
}
