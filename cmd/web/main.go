package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/MartyMav/QBR/cmd/internal/models"

	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/database"

	"github.com/MartyMav/QBR/cmd/internal/websocket"
)

func main() {
	config.App.Setup()

	database.Connect()

	mailChan := make(chan models.MailData)
	config.App.MailChan = mailChan
	defer close(config.App.MailChan)

	listenForMail()

	websocket.Rooms = make(map[*websocket.Room]bool)

	var port string
	var portPrefix string

	if config.App.InProduction {
		portPrefix = ":"
		port = os.Getenv("PORT")
	} else {
		portPrefix = "localhost:"
		port = "5000"
	}

	fmt.Println("Starting Quick Brain Racers Server on " + port)

	srv := &http.Server{
		Addr:    portPrefix + port,
		Handler: routes(),
	}

	err := srv.ListenAndServe()
	log.Fatal(err)
}
