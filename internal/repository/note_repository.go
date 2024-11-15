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
	err := r.db.Raw(`
		WITH LatestVersions AS (
			SELECT note_id, MAX(created_at) as max_created_at
			FROM versions
			GROUP BY note_id
		)
		SELECT 
			n.id,
			n.created_at,
			n.updated_at,
			n.deleted_at,
			v.title,
			v.content,
			v.color,
			n.archived,
			n.pinned
		FROM notes n
		INNER JOIN versions v ON n.id = v.note_id
		INNER JOIN LatestVersions lv 
			ON v.note_id = lv.note_id 
			AND v.created_at = lv.max_created_at
		WHERE n.deleted_at IS NULL
	`).Scan(&notes).Error
	return notes, err
}

func (r *NoteRepository) FindByID(id uint) (*models.Note, error) {
	var note models.Note
	err := r.db.First(&note, id).Error
	return &note, err
}

func (r *NoteRepository) Update(note *models.Note) error {
	return r.db.Model(note).Updates(map[string]interface{}{
		"updated_at": time.Now(),
		"archived":   note.Archived,
		"pinned":     note.Pinned,
	}).Error
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
