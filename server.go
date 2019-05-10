package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

const (
	DEFAULT_PORT  = 8080
)

type serverConfig struct {
	Port int
	Env  string
}

var config = serverConfig{
	Env:  "dev",
	Port: DEFAULT_PORT,
}

func init() {
	envPort := os.Getenv("PORT")
	if envPort != "" {
		if p, err := strconv.Atoi(envPort); err != nil && p > 0 {
			config.Port = p
		}
	}
	flagPort := flag.Int("port", DEFAULT_PORT, "port to listen at")
	if *flagPort != DEFAULT_PORT {
		config.Port = *flagPort
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "production" {
		config.Env = env
	}
}

func main() {

	r := mux.NewRouter()

	if config.Env == "dev" {
		staticFS := http.FileServer(http.Dir("./static"))
		r.PathPrefix("/").Handler(http.StripPrefix("/", staticFS))
	}

	log.Println("Listening...")
	log.Fatal(http.ListenAndServe(
		fmt.Sprintf(":%d", config.Port),
		handlers.LoggingHandler(os.Stdout, r),
	))
}
