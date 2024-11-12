package main

import (
	"log"
	"net/http"

	"github.com/guisithos/notego/internal/api/handlers"
	"github.com/guisithos/notego/internal/config"
	"github.com/guisithos/notego/internal/repository"
	"github.com/guisithos/notego/internal/service"
)

func initRouter(noteHandler *handlers.NoteHandler) *http.ServeMux {
	router := http.NewServeMux()
	router.HandleFunc("/notes", noteHandler.HandleNotes)
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

	// Start
	log.Printf("Server starting on %s", cfg.ServerAddress)
	log.Fatal(http.ListenAndServe(cfg.ServerAddress, router))
}
