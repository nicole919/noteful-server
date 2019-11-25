const path = require("path");
const express = require("express");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  folder_id: folder.folder_id,
  folder_title: folder.folder_title
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");

    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { folder_title } = req.body;
    const newFolder = { folder_title };

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: ` missing ${key} in request body` }
        });

    FoldersService.postFolder(knexInstance, newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `${folder.folder_id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/:folder_id")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");
    const folder_id = req.params.folder_id;

    FoldersService.getById(knexInstance, folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `folder does not exist` }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");
    const folderToDelete = req.params.folder_id;

    FoldersService.deleteFolder(knexInstance, folderToDelete)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const folderToUpdate = req.params.folder_id;
    const { folder_title } = req.body;
    const updatedFolder = { folder_title };

    if (!folder_title) {
      return res.status(400).json({
        error: { message: `request body must contain ${key}` }
      });
    }
    FoldersService.updateFolder(knexInstance, folderToUpdate, updatedFolder)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
module.exports = foldersRouter;
