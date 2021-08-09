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
	var dsn string

	if config.App.InProduction {
		dsn = config.App.DATABASE_URL
	} else {
		dsn = fmt.Sprintf("host=%v user=%v password=%v dbname=%v port=%v sslmode=disable", config.App.DBHost, config.App.DBUser, config.App.DBPass, config.App.DBName, config.App.DBPort)
	}

	connection, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Could not connect to DB!")
	}

	fmt.Println(connection)
	DB = connection

	connection.AutoMigrate(&models.User{})
}
