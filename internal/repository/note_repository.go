package repository

import (
	"time"

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
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&notes).Error
	if err != nil {
		return nil, err
	}
	return notes, nil
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
	return r.db.Transaction(func(tx *gorm.DB) error {
		var note models.Note
		if err := tx.First(&note, id).Error; err != nil {
			return err
		}

		result := tx.Model(&note).Update("deleted_at", time.Now())
		if result.Error != nil {
			return result.Error
		}

		return nil
	})
}

func (r *NoteRepository) Transaction(fn func(*gorm.DB) error) error {
	return r.db.Transaction(fn)
}
