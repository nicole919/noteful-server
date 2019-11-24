const path = require("path");
const express = require("express");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  title: note.text,
  folderId: note.folderId,
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
    const { title, folderId, content, modified } = req.body;
    const newNote = { title, folderId, content, modified };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        });
    NotesService.insertNote(req.app.get("db"), newNote)
      .then(note => {
        res
          .status(201)
          .location(
            path.posix
              .join(req.originalUrl, `/${note.id}`)
              .json(serializeNote(note))
          );
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
    const { title, folderId, content, modified } = req.body;
    const noteToUpdate = {
      title: title,
      folderId: folderId,
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
    NotesService.updateNote(req.app.get("db"), req.params.title, noteToUpdate)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
