package config

import (
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// AppConfig holds the application config
type AppConfig struct {
	InProduction bool
	Address      string
}

func (app *AppConfig) Setup() {
	rand.Seed(time.Now().UnixNano())

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	app.InProduction, err = strconv.ParseBool(os.Getenv("IN_PRODUCTION"))
	if err != nil {
		log.Fatal("Error loading IN_PRODUCTION env variable")
	}

	app.Address = os.Getenv("ADDRESS")
}
