package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/models"
	"github.com/golang-jwt/jwt"
)

type CustomClaims struct {
	Email       string `json:"email"`
	Username    string `json:"username"`
	GamesPlayed int    `json:"gamesPlayed"`
	GamesWon    int    `json:"gamesWon"`
	jwt.StandardClaims
}

func newCustomClaims(user models.User, expiryDate time.Time) *CustomClaims {
	return &CustomClaims{
		user.Email,
		user.Username,
		user.GamesPlayed,
		user.GamesWon,
		jwt.StandardClaims{
			Issuer:    strconv.Itoa(int(user.Id)),
			ExpiresAt: expiryDate.Unix(),
		},
	}
}

func GenerateToken(user models.User, expiryDate time.Time) (string, error) {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, newCustomClaims(user, expiryDate))

	token, err := claims.SignedString([]byte(config.App.SecretKey))
	if err != nil {
		return "", err
	}

	return token, nil
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

func NewCookie(token string, expiryDate time.Time) *http.Cookie {
	return &http.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  expiryDate,
		HttpOnly: false,
		Secure:   config.App.InProduction,
	}
}
