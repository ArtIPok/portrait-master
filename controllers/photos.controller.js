const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const requestIp = require('request-ip');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      const titlePhoto = new RegExp(/^([A-z]|\s|[0-9]|\.){1,25}$/);
      if(!titlePhoto.test(title)) throw new Error('Invlid title photo!');

      const authorPhoto = new RegExp(/^([A-z]|\s|[0-9]|\.){1,50}$/);
      if(!authorPhoto.test(author)) throw new Error('Wrong author photo!');

      const emailPhoto = new RegExp(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z]{1,6}))$/i);
      if(!emailPhoto.test(email)) throw new Error('Wrong email!');

      if(fileExt === 'gif' || fileExt === 'jpg' || fileExt === 'png') {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });

        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);  
      } else {
        throw new Error('Wrong file!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });

    const ipMiddleware = function(req, res, next) {
      const clientIp = requestIp.getClientIp(req); 
      next();
    };

    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const voter = await Voter.findOne({ idUser: req.clientIp });
      if(!voter) {
        const newVoter = new Voter({ idUser: req.clientIp, votes: [photoToUpdate._id] });
        await newVoter.save();
      } else {
        if(voter.votes.includes(photoToUpdate._id)) {
          throw new Error('Double vote!');
        } else {
            voter.votes.push(photoToUpdate._id);
            await voter.save();
        }
      }
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
