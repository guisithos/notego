package repository

import (
	"github.com/guisithos/notego/internal/models"
	"gorm.io/gorm"
)

type VersionRepository struct {
	db *gorm.DB
}

func NewVersionRepository(db *gorm.DB) *VersionRepository {
	return &VersionRepository{db: db}
}

func (r *VersionRepository) Create(version *models.NoteVersion) error {
	return r.db.Create(version).Error
}

func (r *VersionRepository) GetLatestHash(noteID uint) string {
	var version models.NoteVersion
	r.db.Where("note_id = ?", noteID).Order("created_at DESC").First(&version)
	return version.CommitHash
}

func (r *VersionRepository) FindByNoteID(noteID uint) ([]models.NoteVersion, error) {
	var versions []models.NoteVersion
	err := r.db.Where("note_id = ?", noteID).Order("created_at DESC").Find(&versions).Error
	return versions, err
}
