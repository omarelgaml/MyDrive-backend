const mongoose = require('mongoose');

const { Schema } = mongoose;

const folderSchema = new Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'files' }],
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'folders' },
  childFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'folders' }],
});

// Export function to create "SomeModel" model class
mongoose.model('folders', folderSchema);
