package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/MartyMav/QBR/cmd/internal/config"
	"github.com/MartyMav/QBR/cmd/internal/models"
	mail "github.com/xhit/go-simple-mail/v2"
)

func listenForMail() {
	go func() {
		for {
			msg := <-config.App.MailChan
			sendMsg(msg)
		}
	}()
}

func sendMsg(m models.MailData) {
	server := mail.NewSMTPClient()
	server.Host = config.App.MailHost
	server.Port = config.App.MailPort
	server.Username = config.App.MailUsername
	server.Password = config.App.MailPassword
	server.Encryption = mail.EncryptionSTARTTLS
	server.KeepAlive = false
	server.ConnectTimeout = 10 * time.Second
	server.SendTimeout = 10 * time.Second

	client, err := server.Connect()
	if err != nil {
		fmt.Println(err)
	}

	email := mail.NewMSG()
	email.SetFrom(m.From).AddTo(m.To).SetSubject(m.Subject)

	//Set path to email templates folder
	dir, err := filepath.Abs("./cmd/email-templates")
	if err != nil {
		log.Fatal(err)
	}

	//Grab specific template
	data, err := ioutil.ReadFile(fmt.Sprintf(dir+"/%s", m.Template))
	if err != nil {
		fmt.Println(err)
	}

	//Grab css file
	css, err := ioutil.ReadFile(dir + "/emails.css")
	if err != nil {
		fmt.Println(err)
	}

	mailTemplate := string(data)
	msgToSend := strings.Replace(mailTemplate, "/* %css% */", string(css), 1)
	msgToSend = strings.Replace(msgToSend, "%email%", m.To, 1)
	msgToSend = strings.Replace(msgToSend, "%link%", m.Link, 2)

	email.SetBody(mail.TextHTML, msgToSend)

	err = email.Send(client)
	if err != nil {
		log.Println(err)
	} else {
		log.Println("Email sent!")
	}
}
