package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/yourusername/notego/internal/models"
	"github.com/yourusername/notego/internal/service"
)

type NoteHandler struct {
	noteService *service.NoteService
}

func NewNoteHandler(noteService *service.NoteService) *NoteHandler {
	return &NoteHandler{noteService: noteService}
}

func (h *NoteHandler) Create(w http.ResponseWriter, r *http.Request) {
	var note models.Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.noteService.CreateNote(&note); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(note)
}

func (h *NoteHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	notes, err := h.noteService.GetNotes()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(notes)
}

func (h *NoteHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	note, err := h.noteService.GetNote(uint(id))
	if err != nil {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(note)
}
