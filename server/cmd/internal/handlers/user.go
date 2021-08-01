package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/forms"
	"github.com/jackc/pgconn"

	"github.com/golang-jwt/jwt"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/database"

	"golang.org/x/crypto/bcrypt"

	"github.com/MartyMav/QBRServer/cmd/internal/models"
)

type CustomClaims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	jwt.StandardClaims
}

func Register(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	form := forms.New(r.PostForm)
	form.Required("email", "password")
	form.MinLength("password", 3)
	form.IsEmail("email")

	if !form.Valid() {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(form)
		return
	}

	email := r.Form.Get("email")
	password, _ := bcrypt.GenerateFromPassword([]byte(r.Form.Get("password")), 14)

	user := models.User{
		Email:    email,
		Password: password,
	}

	if results := database.DB.Create(&user); results.Error != nil {
		//Error 23505 - record already exists in DB
		if pgError := results.Error.(*pgconn.PgError); errors.Is(results.Error, pgError) {
			switch pgError.Code {
			case "23505":
				w.WriteHeader(http.StatusConflict)
				json.NewEncoder(w).Encode("Email already exists")
				return
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}

func Login(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	email := r.Form.Get("email")
	password := r.Form.Get("password")

	form := forms.New(r.PostForm)
	form.Required("email", "password")
	form.IsEmail("email")

	if !form.Valid() {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(form)
		return
	}

	var user models.User
	expiryDate := time.Now().Add(time.Hour * 24) //1 day

	database.DB.Where("email = ?", email).First(&user)

	if user.Id == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode("Email not found")
		return
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(password)); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode("Incorrect password")
		return
	}

	customClaims := CustomClaims{
		user.Email,
		user.Username,
		jwt.StandardClaims{
			Issuer:    strconv.Itoa(int(user.Id)),
			ExpiresAt: expiryDate.Unix(),
		},
	}
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, customClaims)

	token, err := claims.SignedString([]byte(config.App.SecretKey))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode("Could not log in")
		return
	}

	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  expiryDate,
		HttpOnly: false,
		Secure:   config.App.InProduction,
	}

	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
}

func User(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie("jwt")

	token, err := jwt.ParseWithClaims(cookie.Value, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.App.SecretKey), nil
	})

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode("Unauthenticated")

	}

	claims := token.Claims.(*jwt.StandardClaims)

	var user models.User

	database.DB.Where("id = ?", claims.Issuer).First(&user)

	json.NewEncoder(w).Encode(user)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Secure:   config.App.InProduction,
	}

	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Logged out!")
}
