package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/websocket"
)

var app config.AppConfig

func main() {
	app.Setup()

	websocket.Rooms = make(map[*websocket.Room]bool)

	fmt.Println("Starting Quick Brain Racers Server on " + app.Address)

	srv := &http.Server{
		Addr:    app.Address,
		Handler: routes(&app),
	}

	err := srv.ListenAndServe()
	log.Fatal(err)
}
