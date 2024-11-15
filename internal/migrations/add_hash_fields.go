package migrations

import (
	"github.com/guisithos/notego/internal/models"
	"gorm.io/gorm"
)

func AddHashFields(db *gorm.DB) error {
	return db.AutoMigrate(&models.Version{})
}
