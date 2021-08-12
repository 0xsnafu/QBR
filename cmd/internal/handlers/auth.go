package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/database"
	"github.com/MartyMav/QBR/cmd/internal/models"
	"github.com/golang-jwt/jwt"
)

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
		SameSite: http.SameSiteNoneMode,
	}
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	email := IsAuthenticated(w, r)

	if email == "" {
		Respond(w, http.StatusUnauthorized, "You need to be signed in!")
		return
	}

	//Get ExpiresAt from old JWT
	oldCookie, _ := r.Cookie("jwt")
	oldToken, err := ParseToken(oldCookie.Value)
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Unauthenticated")
		return
	}

	oldClaims := oldToken.Claims.(*jwt.StandardClaims)

	var user models.User
	database.DB.Where("email = ?", email).First(&user)

	//Create new token with updated data
	token, err := GenerateToken(user, time.Unix(oldClaims.ExpiresAt, 0))
	if err != nil {
		Respond(w, http.StatusInternalServerError, "Could not log in")
		return
	}

	http.SetCookie(w, NewCookie(token, time.Unix(oldClaims.ExpiresAt, 0)))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func IsAuthenticated(w http.ResponseWriter, r *http.Request) string {
	cookie, _ := r.Cookie("jwt")

	token, err := ParseToken(cookie.Value)
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Unauthenticated")
		return ""
	}

	claims := token.Claims.(*jwt.StandardClaims)

	var user models.User

	database.DB.Where("id = ?", claims.Issuer).First(&user)

	return user.Email
}
