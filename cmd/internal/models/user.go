package models

import (
	"time"
)

type User struct {
	Id          uint   `json:"id"`
	Email       string `json:"email" gorm:"unique"`
	Username    string `json:"username"`
	Password    []byte `json:"-"`
	GamesPlayed int    `json:"gamesPlayed"`
	GamesWon    int    `json:"gamesWon"`
	IsVerified  bool   `json:"isVerified"`
	Token       string
	CreatedAt   time.Time
}

//Holds an email message
type MailData struct {
	To       string
	From     string
	Subject  string
	Link     string
	Template string
}
