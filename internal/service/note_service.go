package service

import (
	"fmt"
	"log"

	"github.com/guisithos/notego/internal/models"
	"github.com/guisithos/notego/internal/repository"
	"github.com/guisithos/notego/pkg/hash"
)

type NoteService struct {
	noteRepo    *repository.NoteRepository
	versionRepo *repository.VersionRepository
}

func NewNoteService(noteRepo *repository.NoteRepository, versionRepo *repository.VersionRepository) *NoteService {
	return &NoteService{
		noteRepo:    noteRepo,
		versionRepo: versionRepo,
	}
}

func (s *NoteService) CreateNote(note *models.Note) error {
	if err := s.noteRepo.Create(note); err != nil {
		return err
	}

	// Create initial version
	version := models.Version{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  "Initial version",
		CommitHash: hash.Generate(note),
		Action:     "create",
	}

	return s.versionRepo.Create(&version)
}

func (s *NoteService) GetNotes() ([]models.Note, error) {
	notes, err := s.noteRepo.FindAll()
	if err != nil {
		log.Printf("Error getting notes from repository: %v", err)
		return nil, err
	}
	log.Printf("Retrieved %d notes from database", len(notes))
	return notes, nil
}

func (s *NoteService) GetNote(id uint) (*models.Note, error) {
	return s.noteRepo.FindByID(id)
}

func (s *NoteService) UpdateNote(note *models.Note, commitMsg string) error {
	// Create new version before updating
	version := models.Version{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  commitMsg,
		ParentHash: s.versionRepo.GetLatestHash(note.ID),
		CommitHash: hash.Generate(note),
		Action:     "update",
	}

	if err := s.versionRepo.Create(&version); err != nil {
		return err
	}

	return s.noteRepo.Update(note)
}

func (s *NoteService) DeleteNote(id uint, commitMsg string) error {
	// Get the current note
	note, err := s.noteRepo.FindByID(id)
	if err != nil {
		log.Printf("Failed to find note with ID %d: %v", id, err)
		return fmt.Errorf("note not found: %w", err)
	}

	// Create a version record for the deletion
	version := models.Version{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  commitMsg,
		CommitHash: hash.Generate(note),
		ParentHash: s.versionRepo.GetLatestHash(note.ID),
		Action:     "delete",
	}

	// Create the version record first
	if err := s.versionRepo.Create(&version); err != nil {
		return fmt.Errorf("failed to create version: %w", err)
	}

	// Then soft delete the note
	if err := s.noteRepo.Delete(id); err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	return nil
}

func (s *NoteService) GetNoteVersions(noteID uint) ([]models.Version, error) {
	return s.versionRepo.FindByNoteID(noteID)
}
