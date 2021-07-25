package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	Name string
	Age  int
}

func Home(w http.ResponseWriter, r *http.Request) {
	fmt.Println("in home")

	newUser := User{
		Name: "Chapito",
		Age:  29,
	}

	json.NewEncoder(w).Encode(newUser)
}
