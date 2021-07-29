package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/database"

	"golang.org/x/crypto/bcrypt"

	"github.com/MartyMav/QBRServer/cmd/internal/models"
)

func Register(w http.ResponseWriter, r *http.Request) error {
	r.ParseForm()

	password, _ := bcrypt.GenerateFromPassword([]byte(r.Form.Get("password")), 14)
	user := models.User{
		Email:    r.Form.Get("email"),
		Password: password,
	}

	database.DB.Create(&user)
	return json.NewEncoder(w).Encode(user)

}

func Login(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()

	var user models.User
	expiryDate := time.Now().Add(time.Hour * 24) //1 day

	database.DB.Where("email = ?", r.Form.Get("email")).First(&user)

	if user.Id == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode("User not found")
		return
	}

	if err := bcrypt.CompareHashAndPassword(user.Password, []byte(r.Form.Get("password"))); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode("Incorrect password")
		return
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    strconv.Itoa(int(user.Id)),
		ExpiresAt: expiryDate.Unix(),
	})

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
		HttpOnly: true,
		Secure:   config.App.InProduction,
	}
	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Success!")
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
