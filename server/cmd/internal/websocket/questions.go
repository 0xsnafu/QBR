package websocket

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"
)

type Question struct {
	Message string `json:"message"`
	Answer  int    `json:"answer"`
	Choices [4]int `json:"choices"`
	Index   int    `json:"index"`
}

func GenerateQuestionBank() []Question {

	questionBank := make([]Question, 0)

	numberOfQuestions, err := strconv.Atoi(os.Getenv("NUMBER_OF_QUESTIONS"))
	if err != nil {
		log.Fatal("Error loading NUMBER_OF_QUESTIONS from .env file")
	}

	for i := 1; i <= numberOfQuestions; i++ {
		question := NewQuestion()
		question.Index = i
		questionBank = append(questionBank, *question)
	}

	return questionBank
}

func NewQuestion() *Question {

	rand.Seed(time.Now().UnixNano())
	firstValue := rand.Intn(11)

	secondValue := rand.Intn(11)

	answer := firstValue + secondValue

	message := fmt.Sprintf("%d + %d = ?", firstValue, secondValue)

	question := Question{
		Message: message,
		Answer:  answer,
		Choices: GenerateChoices(answer),
		Index:   0,
	}

	return &question
}

func GenerateChoices(answer int) [4]int {

	rand.Seed(time.Now().UnixNano())
	correctChoiceIndex := rand.Intn(4)
	choices := [4]int{420, 420, 420, 420}
	index := 0

	for ok := true; ok; ok = (!Includes(choices, answer)) {

		rand.Seed(time.Now().UnixNano())
		var incorrectChoice int

		//Just to randomize the incorrect option, even indexes will be over and uneven under relative to answer
		if rand.Intn(5) < 2 {
			incorrectChoice = answer + rand.Intn(3)
		} else {
			incorrectChoice = answer - rand.Intn(3)
		}

		//If generated incorrect choice already exists or is == answer, do another iteration
		if Includes(choices, incorrectChoice) || incorrectChoice == answer {
			continue
		} else {
			choices[index] = incorrectChoice
			index++

			if index == 4 {
				break

			}
		}

	}

	choices[correctChoiceIndex] = answer

	return choices
}

func Includes(arr [4]int, key int) bool {
	for _, choice := range arr {
		if key == choice {
			return true
		}
	}

	return false
}
