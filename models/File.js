const mongoose = require('mongoose');

const { Schema } = mongoose;

const fileSchema = new Schema({
  originalName: String,
  extension: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'folders' },
});

// Export function to create "SomeModel" model class
mongoose.model('files', fileSchema);
