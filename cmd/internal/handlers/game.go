package handlers

import (
	"github.com/MartyMav/QBR/cmd/internal/database"
	"github.com/MartyMav/QBR/cmd/internal/models"
)

func SaveMatchResults(isWinner bool, id uint) {

	var user models.User
	database.DB.Where("id = ?", id).First(&user)

	user.GamesPlayed++

	if isWinner {
		user.GamesWon++
	}

	database.DB.Save(&user)
}
