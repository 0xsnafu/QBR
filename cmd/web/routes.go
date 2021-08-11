package main

import (
	"net/http"

	"github.com/MartyMav/QBRServer/cmd/internal/handlers"
	"github.com/rs/cors"

	"github.com/go-chi/chi"

	"github.com/MartyMav/QBRServer/cmd/internal/websocket"
)

func routes() http.Handler {
	mux := chi.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://quickbrainracers.com"},
		AllowCredentials: true,
	})

	mux.Use(c.Handler)

	//Emails
	mux.Post("/send-verify-email", func(w http.ResponseWriter, r *http.Request) {
		handlers.SendVerifyEmail(w, r)
	})
	mux.Get("/verify-email/{token}", func(w http.ResponseWriter, r *http.Request) {
		handlers.VerifyEmail(w, r)
	})
	mux.Post("/send-password-reset", func(w http.ResponseWriter, r *http.Request) {
		handlers.SendPasswordResetEmail(w, r)
	})
	mux.Post("/reset-password", func(w http.ResponseWriter, r *http.Request) {
		handlers.ResetPassword(w, r)
	})

	//Auth
	mux.Get("/getuser", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetUser(w, r)
	})

	//User
	mux.Post("/updatepassword", func(w http.ResponseWriter, r *http.Request) {
		handlers.UpdatePassword(w, r)
	})
	mux.Post("/setusername", func(w http.ResponseWriter, r *http.Request) {
		handlers.SetUsername(w, r)
	})
	mux.Post("/logout", func(w http.ResponseWriter, r *http.Request) {
		handlers.Logout(w, r)
	})
	mux.Post("/register", func(w http.ResponseWriter, r *http.Request) {
		handlers.Register(w, r)
	})
	mux.Post("/login", func(w http.ResponseWriter, r *http.Request) {
		handlers.Login(w, r)
	})

	//Sockets
	mux.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(w, r)
	})

	mux.Get("/search", func(w http.ResponseWriter, r *http.Request) {
		params := r.URL.Query()
		wasRoomFound := false

		for room := range websocket.Rooms {
			if room.ID == params.Get("roomID") {
				wasRoomFound = true

				if len(room.Clients) == room.MaxClients {
					w.WriteHeader(http.StatusNotAcceptable)
				} else {
					w.WriteHeader(http.StatusOK)
				}

				r.Body.Close()
			}
		}

		if !wasRoomFound {
			w.WriteHeader(http.StatusNotFound)
			r.Body.Close()
		}
	})

	return mux
}
