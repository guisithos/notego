package main

import (
	"log"
	"net/http"

	"github.com/yourusername/notego/internal/api/handlers"
	"github.com/yourusername/notego/internal/config"
	"github.com/yourusername/notego/internal/repository"
	"github.com/yourusername/notego/internal/service"
)

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
