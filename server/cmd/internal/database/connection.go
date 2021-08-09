package database

import (
	"fmt"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf("host=localhost user=%v password=%v dbname=postgres port=5432 sslmode=disable", config.App.DBUser, config.App.DBPass)

	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Could not connect to DB!")
	}

	DB = connection

	connection.AutoMigrate(&models.User{})
}
