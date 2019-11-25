const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },

  postFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("folders")
      .returning("*")
      .then(rows => rows[0]);
  },

  getById(knex, id) {
    return knex
      .from("folders")
      .select("*")
      .where("folder_id", id)
      .first();
  },
  deleteFolder(knex, id) {
    return knex("folders")
      .where("folder_id", id)
      .delete();
  },
  updateFolder(knex, id, updatedFolder) {
    return knex("folders")
      .where("folder_id", id)
      .update(updatedFolder);
  }
};

module.exports = FoldersService;
