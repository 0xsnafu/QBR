package handlers

import (
	"github.com/MartyMav/QBRServer/cmd/internal/database"
	"github.com/MartyMav/QBRServer/cmd/internal/models"
)

func SaveMatchResults(isWinner bool, email string) {

	var user models.User
	database.DB.Where("email = ?", email).First(&user)

	user.GamesPlayed++

	if isWinner {
		user.GamesWon++
	}

	database.DB.Save(&user)
}
