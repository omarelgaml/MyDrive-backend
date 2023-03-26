/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const isImage = require('is-image');
const isVideo = require('is-video');
const pdfThumbnail = require('pdf-thumbnail');
const fs = require('fs');

const User = mongoose.model('users');
const Folder = mongoose.model('folders');
const File = mongoose.model('files');

const Api400Error = require('../config/api400Error');

const generateVideoThumbnail = (filePath, outputDir, fileName, time) =>
  new Promise((resolve, reject) => {
    // Use fluent-ffmpeg to generate thumbnail
    ffmpeg(filePath)
      .screenshots({
        count: 1,
        folder: outputDir,
        filename: `${fileName}.jpg`,
        timestamps: [time],
        size: '200x200',
      })
      .on('end', () => {
        const thumbnailBuffer = fs.readFileSync(`${outputDir}/${fileName}.jpg`);
        resolve(thumbnailBuffer);
      })
      .on('error', (err) => {
        reject(err);
      });
  });

// this takes the files and generate a thumbnail according to the file type
// if the type of the file is video, the generateVideoThumbnail will be called.
const generateThumbNail = async (file, extension, fileId) => {
  if (isImage(file.path)) {
    // Generate thumbnail for image files
    const thumbnailName = `${fileId}.${extension}`;
    await sharp(file.path)
      .resize(200, 200)
      .toFile(`uploads/thumbnails/${thumbnailName}`);
    return thumbnailName;
  }
  if (extension === 'pdf') {
    const data = await pdfThumbnail(fs.readFileSync(file.path));
    const stream = data.pipe(
      fs.createWriteStream(`uploads/thumbnails/${fileId}.jpg`)
    );
    await new Promise((resolve, reject) => {
      stream
        .on('finish', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });

    return `${fileId}.jpg`;
  }
  if (isVideo(file.path)) {
    await generateVideoThumbnail(
      file.path,
      'uploads/thumbnails',
      fileId,
      '00:00:05'
    );
    return `${fileId}.jpg`;
  }
  return '';
};
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
  }
};

exports.uploadFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const userId = req.body.userId;
    const size = req.body.size;
    const folderId = req.body.folderId;

    if (!files) {
      throw new Api400Error(`No files uploaded.`);
    }

    let currentUser = await User.findOne({ _id: userId });
    let currentFolder = folderId
      ? await Folder.findOne({ _id: folderId })
      : null;

    // eslint-disable-next-line guard-for-in
    for (const f in files) {
      const file = files[f];

      const filSplit = file.originalname.split('.');

      if (!filSplit.length)
        throw new Api400Error(`Please, upload file with extension`);

      const extension = filSplit[filSplit.length - 1];

      const newFile = new File({
        originalName: file.originalname,
        parentFolder: folderId || null,
        extension,
      });

      const thumbnailUrl = await generateThumbNail(
        file,
        extension,
        newFile._id
      );

      newFile.thumbnailUrl = thumbnailUrl;

      await newFile.save();

      // to distinguish between uploading files to user directly or to folder
      if (currentFolder) currentFolder.files.push(newFile._id);
      else currentUser.files.push(newFile._id);

      fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
    }
    if (currentFolder) {
      currentFolder = await currentFolder.save();

      currentFolder = await Folder.populate(
        currentFolder,
        'childFolders files'
      );
    }

    currentUser.usedStorage += Number(size);

    currentUser = await currentUser.save();

    const user = await User.populate(currentUser, 'childFolders files');

    res
      .status(200)
      .send({ folder: currentFolder, user, message: 'Files Uploaded' });
  } catch (err) {
    console.log(err);
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

// exports.addFilestoUser = async (req, res, next) => {
//   try {
//     const files = req.files;

//     const userId = req.body.userId;

//     const size = req.body.size;

//     if (!files || !userId) {
//       throw new Api400Error(`Bad request`);
//     }
//     let currentUser = await User.findOne({ _id: userId });

//     // eslint-disable-next-line guard-for-in
//     for (const f in files) {
//       const file = files[f];

//       const filSplit = file.originalname.split('.');
//       if (!filSplit.length)
//         throw new Api400Error(`Please, upload file with extension`);
//       const extension = filSplit[filSplit.length - 1];

//       const newFile = new File({
//         originalName: file.originalname,
//         extension,
//       });
//       const thumbnailUrl = await generateThumbNail(
//         file,
//         extension,
//         newFile._id
//       );
//       newFile.thumbnailUrl = thumbnailUrl;
//       await newFile.save();

//       currentUser.files.push(newFile._id);
//       fs.renameSync(file.path, `uploads/${newFile._id}.${extension}`);
//     }
//     currentUser.usedStorage += Number(size);
//     currentUser = await currentUser.save();
//     const user = await User.populate(currentUser, 'childFolders files');

//     // currentFolder = await Folder.populate(currentFolder, 'childFolders files');
//     res.status(200).send({ user, message: 'Files Uploaded' });
//   } catch (err) {
//     next(err);
//   }
// };
