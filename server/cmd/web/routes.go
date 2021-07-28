package main

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/MartyMav/QBRServer/cmd/internal/config"
	"github.com/MartyMav/QBRServer/cmd/internal/websocket"
)

func routes(app *config.AppConfig) http.Handler {
	mux := chi.NewRouter()

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
		}
	})

	return mux
}
