package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/forms"
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgconn"
	"gorm.io/gorm"

	"github.com/MartyMav/QBR/cmd/internal/database"

	"golang.org/x/crypto/bcrypt"

	"github.com/MartyMav/QBR/cmd/internal/models"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	//Verify form
	form := forms.New(r.PostForm)
	form.Required("email", "password")
	form.MinLength("password", 3)
	form.IsEmail("email")

	if !form.Valid() {
		Respond(w, http.StatusBadRequest, "Password be at least 3 characters")
		return
	}

	//Prepare User params
	email := r.Form.Get("email")
	password, _ := bcrypt.GenerateFromPassword([]byte(r.Form.Get("password")), 14)
	token, err := GenerateToken(models.User{}, time.Now().Add(time.Hour*48)) //In 2 days
	if err != nil {
		return
	}

	user := models.User{
		Email:    email,
		Password: password,
		Token:    token,
	}

	//Attempt to create user
	if results := database.DB.Create(&user); results.Error != nil {
		//Error 23505 - record already exists in DB
		if pgError := results.Error.(*pgconn.PgError); errors.Is(results.Error, pgError) {
			switch pgError.Code {
			case "23505":
				Respond(w, http.StatusConflict, "Email already exists")
				return
			}
		}
	}

	//Send a verification email to user
	msg := models.MailData{
		To:       email,
		From:     "quickbrainracers@gmail.com",
		Subject:  "Quick Brain Racers: Verify your email",
		Link:     "http://localhost:5000/verify-email/" + token,
		Template: "verify-email.html",
	}
	config.App.MailChan <- msg

	w.WriteHeader(http.StatusOK)
}

func Login(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	email := r.Form.Get("email")
	password := r.Form.Get("password")

	//Verify form
	form := forms.New(r.PostForm)
	form.Required("email", "password")
	form.IsEmail("email")

	if !form.Valid() {
		Respond(w, http.StatusBadRequest, "Email or password are incorrect")
		return
	}

	var user models.User
	expiryDate := time.Now().Add(time.Hour * 72) //3 days

	database.DB.Where("email = ?", email).First(&user)

	if user.Id == 0 {
		Respond(w, http.StatusNotFound, "Email not found")
		return
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
		Respond(w, http.StatusBadRequest, "Incorrect password")
		return
	}

	token, err := GenerateToken(user, expiryDate)
	if err != nil {
		Respond(w, http.StatusInternalServerError, "Could not log in")
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(token)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	Respond(w, http.StatusOK, "Logged out!")
}

func SetUsername(w http.ResponseWriter, r *http.Request) {
	if !IsAuthorized(r) {
		Respond(w, http.StatusUnauthorized, "You need to be signed in!")
		return
	}

	//Check form validity
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	username := r.Form.Get("username")

	//Verify form
	form := forms.New(r.PostForm)
	form.MinLength("username", 3)

	if !form.Valid() {
		Respond(w, http.StatusBadRequest, "Username must be at least 3 characters")
		return
	}

	token, err := ParseToken(r.Header.Get("Authorization"))
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	claims := token.Claims.(*jwt.StandardClaims)

	result := map[string]interface{}{}

	//Check if user already has username
	database.DB.Model(&models.User{}).Where("id = ?", claims.Issuer).First(&result)
	if len(result["username"].(string)) > 0 {
		Respond(w, http.StatusBadRequest, "You already have a username!")
		return
	}

	//Check if username already exists
	dbErr := database.DB.Model(&models.User{}).Where("username = ?", username).First(&result)
	if errors.Is(dbErr.Error, gorm.ErrRecordNotFound) {
		database.DB.Table("users").Where("id = ?", claims.Issuer).Updates(models.User{Username: username})
		Respond(w, http.StatusOK, "Username set!")
	} else {
		Respond(w, http.StatusConflict, "Username already exists")
	}

}

func UpdatePassword(w http.ResponseWriter, r *http.Request) {
	if !IsAuthorized(r) {
		Respond(w, http.StatusUnauthorized, "You need to be signed in!")
		return
	}

	//Check form validity
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	oldPass := r.Form.Get("oldPass")
	newPass := r.Form.Get("newPass")

	form := forms.New(r.PostForm)
	form.Required("oldPass", "newPass")
	form.MinLength("newPass", 3)

	if !form.Valid() {
		Respond(w, http.StatusBadRequest, "Password be at least 3 characters")
		return
	}

	token, err := ParseToken(r.Header.Get("Authorization"))
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	claims := token.Claims.(*jwt.StandardClaims)

	var user models.User
	database.DB.Where("id = ?", claims.Issuer).First(&user)

	//Check if old password is correct
	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(oldPass)); err != nil {
		Respond(w, http.StatusBadRequest, "Incorrect password")
		return
	}

	//Set new password
	password, _ := bcrypt.GenerateFromPassword([]byte(newPass), 14)
	user.Password = password
	database.DB.Save(&user)

	Respond(w, http.StatusOK, "Password successfully updated!")
}

func Respond(w http.ResponseWriter, status int, msg string) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(msg)
}
