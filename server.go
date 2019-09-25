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
	DEFAULT_PORT = 8080
)

type serverConfig struct {
	Port             int
	Env              string
	OriginTrialToken string
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

	otToken := os.Getenv("ORIGIN_TRIAL_TOKEN")
	if otToken != "" {
		config.OriginTrialToken = otToken
	}
}

func originTrialMiddlewareMaker(token string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("Origin-Trial", token)
			next.ServeHTTP(w, r)
		})
	}
}

func main() {

	r := mux.NewRouter()

	if config.OriginTrialToken != "" {
		r.Use(originTrialMiddlewareMaker(config.OriginTrialToken))
	}

	if config.Env == "dev" {
		staticFS := http.FileServer(http.Dir("./static/dist"))
		r.PathPrefix("/").Handler(http.StripPrefix("/", staticFS))
	}

	log.Println("Listening...")
	if config.Env == "dev" {
		log.Printf("Dev Server: http://127.0.0.1:%d\n", config.Port)
	}
	log.Fatal(http.ListenAndServe(
		fmt.Sprintf(":%d", config.Port),
		handlers.LoggingHandler(os.Stdout, r),
	))
}
