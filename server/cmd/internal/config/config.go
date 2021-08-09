package config

import (
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/models"

	"github.com/joho/godotenv"
)

// AppConfig holds the application config
type AppConfig struct {
	InProduction bool
	Address      string
	DATABASE_URL string
	DBName       string
	SecretKey    string
	MailChan     chan models.MailData
	MailHost     string
	MailPort     int
	MailUsername string
	MailPassword string
	DBHost       string
	DBUser       string
	DBPass       string
	DBPort       int
}

var App AppConfig

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

	if App.InProduction {
		app.DATABASE_URL = os.Getenv("DATABASE_URL")
	} else {
		app.DBHost = os.Getenv("DB_HOST")
		app.DBUser = os.Getenv("DB_USER")
		app.DBPass = os.Getenv("DB_PASS")
		app.DBPort, _ = strconv.Atoi(os.Getenv("DB_PORT"))
		app.DBName = os.Getenv("DB_NAME")
	}

	app.Address = os.Getenv("ADDRESS")
	app.SecretKey = os.Getenv("SECRET_KEY")
	app.MailHost = os.Getenv("MAIL_HOST")
	app.MailPort, _ = strconv.Atoi(os.Getenv("MAIL_PORT"))
	app.MailUsername = os.Getenv("MAIL_USERNAME")
	app.MailPassword = os.Getenv("MAIL_PASSWORD")
}
