const router = require('express').Router();
const multer = require('multer');
const foldersController = require('../controllers/foldersController');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

router.post('/add-folder', foldersController.addFolder);
router.post('/upload', upload.array('file'), foldersController.upload);
router.post(
  '/upload-to-folder',
  upload.array('uploadImages'),
  foldersController.uploadToFolder
);

router.post('/get-by-id', foldersController.getFolderbyId);
router.post('/add-folder-to-folder', foldersController.addFolderToFolder);
router.post(
  '/add-file-to-user',
  upload.array('uploadImages'),
  foldersController.addFilestoUser
);

module.exports = router;
