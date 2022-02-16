package database

import (
	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := config.App.DATABASE_URL

	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Could not connect to DB!")
	}

	DB = connection

	connection.AutoMigrate(&models.User{})
}
