package handlers

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/database"
	"github.com/MartyMav/QBRServer/cmd/internal/models"
	"github.com/go-chi/chi"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

//Manually triggered by user. Resends the verification email
func SendVerifyEmail(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	email := r.Form.Get("email")

	token, err := GenerateToken(models.User{}, time.Now().Add(time.Hour*48)) //In 2 days
	if err != nil {
		return
	}

	database.DB.Table("users").Where("email = ?", email).Updates(models.User{Token: token})

	msg := models.MailData{
		To:       email,
		From:     "quickbrainracers@gmail.com",
		Subject:  "Quick Brain Racers: Verify your email",
		Link:     os.Getenv("URL") + ":5000/verify-email/" + token,
		Template: "verify-email.html",
	}
	config.App.MailChan <- msg

	Respond(w, http.StatusOK, "Verification email sent!")
}

//Called when user clicks on Verify button in Verify Email email
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	userToken := chi.URLParam(r, "token")

	token, err := ParseToken(userToken)
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Token is invalid")
		return
	}

	claims := token.Claims.(*jwt.StandardClaims)

	//Check for token expiration
	if claims.ExpiresAt < time.Now().Unix() {
		Respond(w, http.StatusUnauthorized, "Token is expired")
		return
	}

	database.DB.Table("users").Where("token = ?", userToken).Updates(models.User{IsVerified: true, Token: "."})
	http.Redirect(w, r, os.Getenv("URL")+":3000/my-profile?verified=true", http.StatusSeeOther)

}

//Manually triggered by user. Sends an email if user forgot password
func SendPasswordResetEmail(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	email := r.Form.Get("email")

	token, err := GenerateToken(models.User{}, time.Now().Add(time.Hour*1)) //In 1 hour
	if err != nil {
		return
	}

	var user models.User

	//check if email exists
	database.DB.Where("email = ?", email).First(&user).Updates(models.User{Token: token})

	if user.Id == 0 {
		Respond(w, http.StatusOK, "Verification email sent, if email exists!")
		return
	}

	user.Token = token
	database.DB.Save(&user)

	msg := models.MailData{
		To:       email,
		From:     "quickbrainracers@gmail.com",
		Subject:  "Quick Brain Racers: Password Reset",
		Link:     os.Getenv("URL") + ":3000/reset-password/" + token,
		Template: "password-reset.html",
	}
	config.App.MailChan <- msg

	Respond(w, http.StatusOK, "Verification email sent, if email exists!")
}

//Called when user clicks on Reset button in Password Reset email
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		log.Println(err)
	}

	newPassword := r.Form.Get("password")
	userToken := r.Form.Get("token")

	token, err := ParseToken(userToken)
	if err != nil {
		Respond(w, http.StatusUnauthorized, "Token is invalid")
		return
	}

	claims := token.Claims.(*jwt.StandardClaims)

	//Check for token expiration
	if claims.ExpiresAt < time.Now().Unix() {
		Respond(w, http.StatusUnauthorized, "Token is expired")
		return
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(newPassword), 14)

	//Save hashed password and clear token
	database.DB.Table("users").Where("token = ?", userToken).Updates(models.User{Password: password, Token: "."})
	Respond(w, http.StatusOK, "Password successfully updated!")

}
