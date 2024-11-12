package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/guisithos/notego/internal/api/handlers"
	"github.com/guisithos/notego/internal/config"
	"github.com/guisithos/notego/internal/repository"
	"github.com/guisithos/notego/internal/service"
)

func initRouter(noteHandler *handlers.NoteHandler) *mux.Router {
	router := mux.NewRouter()

	// CORS middleware
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Commit-Message")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	router.HandleFunc("/notes", noteHandler.HandleNotes).Methods("GET", "POST", "OPTIONS")
	router.HandleFunc("/notes/{id}", noteHandler.GetByID).Methods("GET", "OPTIONS")
	router.HandleFunc("/notes/{id}", noteHandler.Update).Methods("PUT", "OPTIONS")
	router.HandleFunc("/notes/{id}", noteHandler.Delete).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/notes/{id}/versions", noteHandler.GetVersions).Methods("GET", "OPTIONS")

	return router
}

func main() {
	// Initialize config
	cfg := config.Load()

	// Initialize database
	db := config.InitDB(cfg)

	// Initialize repositories
	noteRepo := repository.NewNoteRepository(db)
	versionRepo := repository.NewVersionRepository(db)

	// Initialize services
	noteService := service.NewNoteService(noteRepo, versionRepo)

	// Initialize handlers
	noteHandler := handlers.NewNoteHandler(noteService)

	// Initialize router
	router := initRouter(noteHandler)

	// Start server
	log.Printf("Server starting on %s", cfg.ServerAddress)
	log.Fatal(http.ListenAndServe(cfg.ServerAddress, router))
}
