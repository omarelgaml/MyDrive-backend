/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = mongoose.model('users');
const Folder = mongoose.model('folders');
const File = mongoose.model('files');

exports.addFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;
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
      cookies: req.cookies,
    });
  } catch (err) {
    res.status(500).send({ message: ' Internal Server Error', err });
  }
};

exports.upload = (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const files = req.files;

  if (!files) {
    res.status(400).send('No files uploaded.');
  }

  // Save the files to the public/files directory
  files.forEach((file) => {
    path.join(__dirname, 'public', 'files', file.originalname);
    const extension = file.originalname.split('.')[1];
    fs.renameSync(file.path, `public/files/newnamae.${extension}`);
  });

  res.status(200).send('Files uploaded successfully.');
};
exports.uploadToFolder = async (req, res) => {
  const files = req.files;

  const folderId = req.body.folderId;

  if (!files) {
    res.status(400).send('No files uploaded.');
  }
  let currentFolder = await Folder.findOne({ _id: folderId });
  // eslint-disable-next-line guard-for-in
  for (const f in files) {
    const file = files[f];
    const newFile = new File({
      originalName: file.originalname,
      parentFolder: folderId,
    });
    await newFile.save();

    currentFolder.files.push(newFile._id);
    const extension = file.originalname.split('.')[1];
    fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
  }
  currentFolder = await currentFolder.save();

  currentFolder = await Folder.populate(currentFolder, 'childFolders files');
  res.status(200).send({ folder: currentFolder });
};
exports.getFolderbyId = async (req, res) => {
  const { id } = req.body;
  const folder = await Folder.findOne({ _id: id }).populate(
    'childFolders files'
  );

  res.status(200).send({
    folder,
  });
};
exports.addFolderToFolder = async (req, res) => {
  const { parentFolder, name } = req.body;

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
  });
};
exports.addFilestoUser = async (req, res) => {
  const files = req.files;

  const userId = req.body.userId;

  if (!files) {
    res.status(400).send('No files uploaded.');
  }
  let currentUser = await User.findOne({ _id: userId });
  // eslint-disable-next-line guard-for-in
  for (const f in files) {
    const file = files[f];
    const newFile = new File({
      originalName: file.originalname,
      // parentFolder: folderId,
    });
    await newFile.save();

    currentUser.files.push(newFile._id);
    const extension = file.originalname.split('.')[1];
    fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
  }
  currentUser = await currentUser.save();

  // currentFolder = await Folder.populate(currentFolder, 'childFolders files');
  res.status(200).send('uploaded');
};
