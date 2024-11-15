package hash

import (
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/guisithos/notego/internal/models"
)

func Generate(note *models.Note, parentHash, commitMsg string) string {
	h := sha256.New()
	data := fmt.Sprintf("%s-%s-%s-%s-%s-%d",
		parentHash, // Previous version's hash
		note.Title,
		note.Content,
		note.Color,
		commitMsg, // Commit message
		time.Now().UnixNano(),
	)
	h.Write([]byte(data))
	return fmt.Sprintf("%x", h.Sum(nil))
}
