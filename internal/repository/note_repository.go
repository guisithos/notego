package repository

import (
	"github.com/guisithos/notego/internal/models"
	"gorm.io/gorm"
)

type NoteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) Create(note *models.Note) error {
	return r.db.Create(note).Error
}

func (r *NoteRepository) FindAll() ([]models.Note, error) {
	var notes []models.Note
	err := r.db.Find(&notes).Error
	return notes, err
}

func (r *NoteRepository) FindByID(id uint) (*models.Note, error) {
	var note models.Note
	err := r.db.First(&note, id).Error
	return &note, err
}

func (r *NoteRepository) Update(note *models.Note) error {
	return r.db.Save(note).Error
}

func (r *NoteRepository) Delete(id uint) error {
	return r.db.Delete(&models.Note{}, id).Error
}
