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
      .where({ id })
      .first();
  }
};

module.exports = FoldersService;
