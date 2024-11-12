package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Note struct {
	gorm.Model
	Title    string
	Content  string
	Color    string
	Archived bool
	Pinned   bool
	Versions []NoteVersion `gorm:"foreignKey:NoteID"`
}

type NoteVersion struct {
	gorm.Model
	NoteID     uint
	Title      string
	Content    string
	Color      string
	CommitHash string
	ParentHash string
	CommitMsg  string
}

var db *gorm.DB

func init() {
	var err error
	dsn := "host=localhost user=postgres password=postgres dbname=notego port=5432 sslmode=disable"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schemas
	db.AutoMigrate(&Note{}, &NoteVersion{})
}

func createNote(w http.ResponseWriter, r *http.Request) {
	var note Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := db.Create(&note).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create initial version
	version := NoteVersion{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  "Initial version",
		CommitHash: generateHash(note),
	}
	db.Create(&version)

	json.NewEncoder(w).Encode(note)
}

func getNotes(w http.ResponseWriter, r *http.Request) {
	var notes []Note
	db.Find(&notes)
	json.NewEncoder(w).Encode(notes)
}

func getNote(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var note Note
	if err := db.First(&note, params["id"]).Error; err != nil {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(note)
}

func updateNote(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var note Note
	if err := db.First(&note, params["id"]).Error; err != nil {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	// Create new version before updating
	version := NoteVersion{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  r.Header.Get("X-Commit-Message"),
		ParentHash: getLatestVersionHash(note.ID),
		CommitHash: generateHash(note),
	}
	db.Create(&version)

	// Update the note
	var updatedNote Note
	if err := json.NewDecoder(r.Body).Decode(&updatedNote); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db.Model(&note).Updates(updatedNote)
	json.NewEncoder(w).Encode(note)
}

func deleteNote(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var note Note
	if err := db.First(&note, params["id"]).Error; err != nil {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}
	db.Delete(&note)
	w.WriteHeader(http.StatusNoContent)
}

func generateHash(note Note) string {
	h := sha256.New()
	data := fmt.Sprintf("%s-%s-%s-%d", note.Title, note.Content, note.Color, time.Now().UnixNano())
	h.Write([]byte(data))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func getLatestVersionHash(noteID uint) string {
	var version NoteVersion
	db.Where("note_id = ?", noteID).Order("created_at DESC").First(&version)
	return version.CommitHash
}

func main() {
	router := mux.NewRouter()

	// Routes
	router.HandleFunc("/notes", createNote).Methods("POST")
	router.HandleFunc("/notes", getNotes).Methods("GET")
	router.HandleFunc("/notes/{id}", getNote).Methods("GET")
	router.HandleFunc("/notes/{id}", updateNote).Methods("PUT")
	router.HandleFunc("/notes/{id}", deleteNote).Methods("DELETE")

	log.Printf("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
