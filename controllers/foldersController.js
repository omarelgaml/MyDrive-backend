/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');
const fs = require('fs');
// const path = require('path');

const User = mongoose.model('users');
const Folder = mongoose.model('folders');
const File = mongoose.model('files');

const Api400Error = require('../config/api400Error');

exports.addFolder = async (req, res, next) => {
  try {
    const { name, parentFolder } = req.body;
    if (!name) throw new Api400Error(`Folder name is required`);
    let { user } = req;

    let newFolder = new Folder({
      name,
      parentFolder,
      files: [],
      childFolders: [],
    });
    newFolder = await newFolder.save();
    user.childFolders.push(newFolder.id);
    user = await user.save();
    user = await User.populate(user, 'childFolders files');
    res.status(200).send({
      user,
      message: 'Folder Added',
    });
  } catch (err) {
    next(err);
    // res.status(500).send({ message: ' Internal Server Error', err });
  }
};

// exports.upload = (req, res, next) => {
//   // eslint-disable-next-line prefer-destructuring
//   try {
//     const files = req.files;

//     if (!files) {
//       throw new Api400Error(`No files uploaded.`);
//     }

//     files.forEach((file) => {
//       path.join(__dirname, 'public', 'files', file.originalname);
//       const extension = file.originalname.split('.')[1];
//       fs.renameSync(file.path, `public/files/newnamae.${extension}`);
//     });

//     res.status(200).send('Files uploaded successfully.');
//   } catch (error) {
//     next(error);
//   }
// };
exports.uploadToFolder = async (req, res, next) => {
  try {
    const files = req.files;

    const folderId = req.body.folderId;
    if (!files) {
      throw new Api400Error(`No files uploaded.`);
    }
    let currentFolder = await Folder.findOne({ _id: folderId });
    // eslint-disable-next-line guard-for-in
    for (const f in files) {
      const file = files[f];
      const filSplit = file.originalname.split('.');
      if (!filSplit.length)
        throw new Api400Error(`Please, upload file with extension`);
      const extension = filSplit[filSplit.length - 1];

      const newFile = new File({
        originalName: file.originalname,
        parentFolder: folderId,
        extension,
      });
      await newFile.save();

      currentFolder.files.push(newFile._id);
      fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
    }
    currentFolder = await currentFolder.save();

    currentFolder = await Folder.populate(currentFolder, 'childFolders files');
    res.status(200).send({ folder: currentFolder, message: 'Files Uploaded' });
  } catch (err) {
    next(err);
  }
};
exports.getFolderbyId = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) throw new Api400Error(`Folder ID is required`);
    const folder = await Folder.findOne({ _id: id }).populate(
      'childFolders files'
    );

    res.status(200).send({
      folder,
    });
  } catch (err) {
    next(err);
  }
};
exports.addFolderToFolder = async (req, res, next) => {
  try {
    const { parentFolder, name } = req.body;
    if (!name || !parentFolder)
      throw new Api400Error(`Folder name is required`);
    let newFolder = new Folder({
      name,
      parentFolder,
      files: [],
      childFolders: [],
    });
    newFolder = await newFolder.save();
    let parent = await Folder.findOne({ _id: parentFolder });
    parent.childFolders.push(newFolder._id);
    parent = await parent.save();
    parent = await Folder.populate(parent, 'childFolders files');
    res.status(200).send({
      folder: parent,
      message: 'Folder added',
    });
  } catch (err) {
    next(err);
  }
};
exports.addFilestoUser = async (req, res, next) => {
  try {
    const files = req.files;

    const userId = req.body.userId;

    if (!files || !userId) {
      throw new Api400Error(`Bad request`);
    }
    let currentUser = await User.findOne({ _id: userId });
    // eslint-disable-next-line guard-for-in
    for (const f in files) {
      const file = files[f];
      const filSplit = file.originalname.split('.');
      if (!filSplit.length)
        throw new Api400Error(`Please, upload file with extension`);
      const extension = filSplit[filSplit.length - 1];

      const newFile = new File({
        originalName: file.originalname,
        extension,
      });
      await newFile.save();

      currentUser.files.push(newFile._id);
      fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
    }
    currentUser = await currentUser.save();
    const user = await User.populate(currentUser, 'childFolders files');

    // currentFolder = await Folder.populate(currentFolder, 'childFolders files');
    res.status(200).send({ user, message: 'Files Uploaded' });
  } catch (err) {
    next(err);
  }
};
