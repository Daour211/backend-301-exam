'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

let server = express();

server.use(cors());
server.use(express.json());

let PORT = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/digimonData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Creating Schema
const digimonSchema = new mongoose.Schema({
  name: String,
  image: String,
  level: String,
});

// Creating Model
const DigimonModel = mongoose.model('digimon', digimonSchema);

server.listen(PORT, () => {
  console.log(`listening from ${PORT}`);
});

// Getting all the data for the API
server.get('/getDigimon', gettingDigimonData);

async function gettingDigimonData(req, res) {
  let digimon = await axios.get(`https://digimon-api.vercel.app/api/digimon`);

  // console.log(digimon.data);

  let digimonArr = digimon.data.map((digimon) => {
    return new Digimon(digimon);
  });
  res.send(digimonArr);
}

// Saving the fav in the db
server.post('/addDigimon', addToFav);

function addToFav(req, res) {
  console.log(req.body);

  let { name, image, level } = req.body;
  const digimonFav = new DigimonModel({
    name: name,
    image: image,
    level: level,
  });

  digimonFav.save();
}

//Getting the fav list to render
server.get('/getFavDigimon', favHandler);

function favHandler(req, res) {
  DigimonModel.find({}, (err, dataFav) => {
    res.send(dataFav);
  });
}

//Removing From Fav list
server.delete('/deleteFav/:id', deleteFav);

function deleteFav(req, res) {
  // console.log(req.params);
  let id = req.params.id;
  DigimonModel.remove({ _id: id }, (err, removedData) => {
    DigimonModel.find({}, (err, newFav) => {
      res.send(newFav);
    });
  });
}

//updating the fav list
server.put('/updateDigimon/:id', updateFav);

function updateFav(req, res) {
  console.log('wokring', req.params, req.body);
  let id = req.params.id;
  let { image, name, level } = req.body;
  DigimonModel.findOne({ _id: id }, (err, updatedData) => {
    (updatedData.name = name),
      (updatedData.image = image),
      (updatedData.level = level),
      updatedData.save().then(() => {
        DigimonModel.find({}, (err, updateDig) => {
          res.send(updateDig);
        });
      });
  });
}

class Digimon {
  constructor(data) {
    this.image = data.img;
    this.name = data.name;
    this.level = data.level;
  }
}
