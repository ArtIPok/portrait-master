const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  idUser: { type: String, require: true },
  photoVote: [{ type: String }],
})

module.exports = mongoose.model('Voter', voterSchema);