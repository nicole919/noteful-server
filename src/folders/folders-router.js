const path = require("path");
const express = require("express");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  folderTitle: folder.folderTitle
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
    const { folderTitle } = req.body;
    const newFolder = { folderTitle };

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: ` missing ${key} in request body` }
        });

    FoldersService.postFolder(req.app.get("db"), newFolder)
      .the(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `api/folder.folderTitle`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/:folderTitle")
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), req.params.folderTitle)
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
  });
module.exports = foldersRouter;
