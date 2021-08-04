package models

type User struct {
	Id          uint   `json:"id"`
	Email       string `json:"email" gorm:"unique"`
	Username    string `json:"username"`
	Password    []byte `json:"-"`
	GamesPlayed int    `json:"gamesPlayed"`
	GamesWon    int    `json:"gamesWon"`
}
