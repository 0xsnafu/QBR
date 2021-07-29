package models

type User struct {
	Id       uint   `json:"id"`
	Email    string `json:"email" gorm:"unique"`
	Password []byte `json:"-"`
}
