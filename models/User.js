const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: String,
  googleId: String,
  facebookId: String,
  fullName: String,
  childFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'folders' }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'files' }],
});

// Export function to create "SomeModel" model class
mongoose.model('users', UserSchema);
