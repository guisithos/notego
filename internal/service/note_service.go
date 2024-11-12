package service

import (
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
	version := models.NoteVersion{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  "Initial version",
		CommitHash: hash.Generate(note),
	}

	return s.versionRepo.Create(&version)
}

func (s *NoteService) GetNotes() ([]models.Note, error) {
	return s.noteRepo.FindAll()
}

func (s *NoteService) GetNote(id uint) (*models.Note, error) {
	return s.noteRepo.FindByID(id)
}

func (s *NoteService) UpdateNote(note *models.Note, commitMsg string) error {
	// Create new version before updating
	version := models.NoteVersion{
		NoteID:     note.ID,
		Title:      note.Title,
		Content:    note.Content,
		Color:      note.Color,
		CommitMsg:  commitMsg,
		ParentHash: s.versionRepo.GetLatestHash(note.ID),
		CommitHash: hash.Generate(note),
	}

	if err := s.versionRepo.Create(&version); err != nil {
		return err
	}

	return s.noteRepo.Update(note)
}

func (s *NoteService) DeleteNote(id uint) error {
	return s.noteRepo.Delete(id)
}

func (s *NoteService) GetNoteVersions(noteID uint) ([]models.NoteVersion, error) {
	return s.versionRepo.FindByNoteID(noteID)
}
