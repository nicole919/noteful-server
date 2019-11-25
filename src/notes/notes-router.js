const path = require("path");
const express = require("express");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  note_id: note.note_id,
  title: note.title,
  folder_id: note.folder_id,
  content: note.content,
  date_published: new Date(note.date_published),
  modified: note.modified
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, folder_id, content, date_published } = req.body;
    const newNote = { title, folder_id, content, date_published };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        });
    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.note_id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/:note_id")
  .all((req, res, next) => {
    NotesService.getById(req.app.get("db"), req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `note does not exist` }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.note_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, folder_id, content, modified } = req.body;
    const noteToUpdate = {
      title: title,
      folder_id: folder_id,
      content: content,
      modified: new Date()
    };
    const numberofValues = Object.values(noteToUpdate).filter(Boolean).length;

    if (numberofValues === 0) {
      return res.status(400).json({
        error: {
          message: `request body must contain either 'title', 'folder', or 'content`
        }
      });
    }
    updatedNote.modified = new Date();

    NotesService.updateNote(req.app.get("db"), req.params.title, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
