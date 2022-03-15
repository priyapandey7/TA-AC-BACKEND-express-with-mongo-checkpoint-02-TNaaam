var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var moment = require('moment');

var Event = require('../models/Event');
var Remarks = require('../models/Remarks');

// multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// list events

// router.get('/', (req, res, next) => {
//   Event.find({}, (err, events) => {
//     if (err) return next(err);
//     res.render('eventsList', { events, moment });
//   });
// });

router.get('/', async (req, res, next) => {
  var allCategories = await Event.distinct('categories');
  var allLocations = await Event.distinct('location');
  Event.find({}, (err, events) => {
    if (err) return next(err);
    res.render('eventsList', {
      events: events,
      moment,
      categoriesArr: allCategories,
      locationArr: allLocations,
    });
  });
});

router.get('/filter', async (req, res, next) => {
  const { category, location, firstdate, lastdate } = req.query;
  var allCategories = await Event.distinct('categories');
  var allLocations = await Event.distinct('location');

  if (category) {
    // console.log(category);
    Event.find({ categories: { $in: [category] } }, (err, events) => {
      if (err) return next(err);
      res.render('eventsList', {
        events: events,
        moment,
        categoriesArr: allCategories,
        locationArr: allLocations,
      });
    });
  } else if (location) {
    // console.log(location);
    Event.find({ location }, (err, events) => {
      if (err) return next(err);
      res.render('eventsList', {
        events: events,
        moment,
        categoriesArr: allCategories,
        locationArr: allLocations,
      });
    });
  } else if (firstdate && lastdate) {
    // console.log(firstdate, lastdate);
    Event.find({ start_date: { $gte: firstdate, $lte: lastdate }}, (err, events) => {
       if (err) return next(err);
       res.render('eventsList', {
         events: events,
         moment,
         categoriesArr: allCategories,
         locationArr: allLocations,
       });
     });
  }
});

// single event details

// router.get('/:id', (req, res, next) => {
//   var id = req.params.id;
//   Event.findById(id, (err, event) => {
//     if (err) return next(err);
//     res.render('eventDetails', { event, moment });
//   });
// });

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  Event.findById(id)
    .populate('remarks')
    .exec((err, event) => {
      if (err) return next(err);
      res.render('eventDetails', { event, moment });
    });
});

// create events

router.post('/', upload.single('cover'), (req, res, next) => {
  req.body.cover = req.file.filename;
  req.body.categories = req.body.categories.toLowerCase().trim().split(',');
  req.body.location = req.body.location.toLowerCase();
  Event.create(req.body, (err, createdEvent) => {
    if (err) return next(err);
    res.redirect('/events');
  });
});

//edit event

router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Event.findById(id, (err, event) => {
    event.categories = event.categories.join(' ');
    if (err) return next(err);
    res.render('editEvent', { event, moment });
  });
});

// update event

router.post('/:id', upload.single('cover'), (req, res, next) => {
  var id = req.params.id;
  req.body.categories = req.body.categories.toLowerCase().trim().split(',');
  req.body.location = req.body.location.toLowerCase();
  if (req.file) {
    req.body.cover = req.file.filename;
  }
  Event.findByIdAndUpdate(id, req.body, { new: true }, (err, updatedEvent) => {
    if (err) return next(err);
    console.log(updatedEvent);
    res.redirect('/events/' + id);
  });
});

// delete event with comment

router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Event.findByIdAndDelete(id, req.body, (err, event) => {
    if (err) return next(err);
    Remarks.deleteMany({ remarks: event.id }, (err) => {
      if (err) return next(err);
      res.redirect('/events');
    });
  });
});

// increment likes

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  Event.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/events/' + id);
  });
});

// decrement likes
router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id;
  Event.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, (err, event) => {
    if (err) return next(err);
    res.redirect('/events/' + id);
  });
});

// add comment

router.post('/:eventId/remarks', (req, res, next) => {
  var eventId = req.params.eventId;
  req.body.eventId = eventId;
  Remarks.create(req.body, (err, remark) => {
    if (err) return next(err);
    // update event with remarkId into remark section
    Event.findByIdAndUpdate(
      eventId,
      { $push: { remarks: remark._id } },
      (err, updatedEvent) => {
        if (err) return next(err);
        res.redirect('/events/' + eventId);
      }
    );
  });
});

module.exports = router;