package models

import "gorm.io/gorm"

type Note struct {
	gorm.Model
	Title    string
	Content  string
	Color    string
	Archived bool
	Pinned   bool
	Versions []NoteVersion `gorm:"foreignKey:NoteID"`
}

type NoteVersion struct {
	gorm.Model
	NoteID     uint
	Title      string
	Content    string
	Color      string
	CommitHash string
	ParentHash string
	CommitMsg  string
}
