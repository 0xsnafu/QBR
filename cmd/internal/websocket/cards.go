package websocket

import (
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"
)

type Card struct {
	Index      int    `json:"index"`
	Color      string `json:"color"`
	IsSelected bool   `json:"isSelected"`
	IsPaired   bool   `json:"isPaired"`
}

func GenerateCards() []Card {

	numberOfCards, err := strconv.Atoi(os.Getenv("NUMBER_OF_CARDS"))
	if err != nil {
		log.Fatal("Error loading NUMBER_OF_CARDS from .env file")
	}

	cards := make([]Card, numberOfCards)

	for i := 1; i <= numberOfCards/2; i++ {
		pair := GenerateCardPair(cards)

		cards[pair[0].Index] = pair[0]
		cards[pair[1].Index] = pair[1]

	}

	return cards
}

func GenerateCardPair(cards []Card) []Card {

	pair := make([]Card, 2)
	color := GetUniqueColor(cards)

	for i := 0; i < 2; i++ {
		card := Card{
			Index:      GetAvailableIndex(cards), //issue: cards will not be updated. func can still select the same index twice!!
			Color:      color,
			IsSelected: false,
			IsPaired:   false,
		}
		cards[card.Index] = card
		pair[i] = card //Might not need this.....
	}

	return pair
}

func GetAvailableIndex(cards []Card) int {
	rand.Seed(time.Now().UnixNano())

	availableIndex := 69
	for {
		randomIndex := rand.Intn(len(cards))

		if cards[randomIndex].Color == "" { //Index hasn't been set yet, "" is the default value
			availableIndex = randomIndex
			break
		}
	}

	return availableIndex
}

func GetUniqueColor(cards []Card) string {
	rand.Seed(time.Now().UnixNano())

	cardColors := strings.Split(os.Getenv("CARD_COLORS"), ",")
	randomColor := ""

	for i := 0; i < len(cardColors); i++ {
		randomColor = cardColors[rand.Intn(len(cardColors))] //Pick random color in color array
		colorExists := false

		//Check all cards to see if color exists already
		for j := 0; j < len(cards); j++ {
			if randomColor == cards[j].Color {
				colorExists = true
				break
			}

		}

		//Found unique color
		if !colorExists {
			break
		}
	}

	return randomColor
}
