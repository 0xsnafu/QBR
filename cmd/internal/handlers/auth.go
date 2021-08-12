package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/database"
	"github.com/MartyMav/QBR/cmd/internal/models"
	"github.com/golang-jwt/jwt"
)

func IsAuthorized(oldToken string) bool {
	if len(oldToken) > 10 { //Found token
		token, err := ParseToken(oldToken)
		if err != nil {
			fmt.Println(err.Error())
			return false
		}

		if token.Valid {
			return true
		}

	}

	return false //There was no token
}

type CustomClaims struct {
	Email       string `json:"email"`
	Username    string `json:"username"`
	GamesPlayed int    `json:"gamesPlayed"`
	GamesWon    int    `json:"gamesWon"`
	IsVerified  bool   `json:"isVerified"`
	jwt.StandardClaims
}

func newCustomClaims(user models.User, expiryDate time.Time) *CustomClaims {
	return &CustomClaims{
		user.Email,
		user.Username,
		user.GamesPlayed,
		user.GamesWon,
		user.IsVerified,
		jwt.StandardClaims{
			Issuer:    strconv.Itoa(int(user.Id)),
			ExpiresAt: expiryDate.Unix(),
		},
	}
}

func GenerateToken(user models.User, expiryDate time.Time) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, newCustomClaims(user, expiryDate))
	signedToken, err := token.SignedString([]byte(config.App.SecretKey))
	if err != nil {
		return "", err
	}

	return signedToken, nil
}

func ParseToken(oldToken string) (*jwt.Token, error) {
	parsedToken, err := jwt.ParseWithClaims(oldToken, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.App.SecretKey), nil
	})
	if err != nil {
		return nil, err
	}

	return parsedToken, nil
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	if !IsAuthorized(r.Header.Get("Authorization")) {
		Respond(w, http.StatusUnauthorized, "You need to be signed in!")
		return
	}

	//Get ExpiresAt from old JWT, so as not to extend the expiry date
	oldToken, err := ParseToken(r.Header.Get("Authorization"))
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var user models.User
	oldClaims := oldToken.Claims.(*jwt.StandardClaims)
	database.DB.Where("id = ?", oldClaims.Issuer).First(&user)

	//Create new token with updated data
	token, err := GenerateToken(user, time.Unix(oldClaims.ExpiresAt, 0))
	if err != nil {
		Respond(w, http.StatusInternalServerError, "Could not log in")
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(token)
}
