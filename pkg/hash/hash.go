package hash

import (
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/guisithos/notego/internal/models"
)

func Generate(note *models.Note) string {
	h := sha256.New()
	data := fmt.Sprintf("%d-%s-%s-%s-%d", note.ID, note.Title, note.Content, note.Color, time.Now().UnixNano())
	h.Write([]byte(data))
	return fmt.Sprintf("%x", h.Sum(nil))
}
