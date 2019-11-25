const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into("notes")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from("notes")
      .select("*")
      .where("note_id", id)
      .first();
  },
  deleteNote(knex, id) {
    return knex("notes")
      .where({ note_id: id })
      .delete();
  },
  updateNote(knex, id, newNoteFields) {
    return knex("notes")
      .where({ note_id: id })
      .update(newNoteFields);
  }
};
module.exports = NotesService;
