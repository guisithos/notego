package models

import "time"

type Note struct {
	ID        uint       `json:"ID" gorm:"primarykey"`
	CreatedAt time.Time  `json:"CreatedAt"`
	UpdatedAt time.Time  `json:"UpdatedAt"`
	DeletedAt *time.Time `json:"DeletedAt,omitempty" gorm:"index"`
	Title     string     `json:"Title"`
	Content   string     `json:"Content"`
	Color     string     `json:"Color"`
	Archived  bool       `json:"Archived"`
	Pinned    bool       `json:"Pinned"`
	Versions  []Version  `json:"Versions,omitempty" gorm:"foreignKey:NoteID"`
}

type Version struct {
	ID         uint      `json:"ID" gorm:"primarykey"`
	CreatedAt  time.Time `json:"CreatedAt"`
	NoteID     uint      `json:"NoteID"`
	Title      string    `json:"Title"`
	Content    string    `json:"Content"`
	Color      string    `json:"Color"`
	CommitMsg  string    `json:"CommitMsg"`
	CommitHash string    `json:"CommitHash"`
	ParentHash string    `json:"ParentHash"`
	Action     string    `json:"Action"`
}
