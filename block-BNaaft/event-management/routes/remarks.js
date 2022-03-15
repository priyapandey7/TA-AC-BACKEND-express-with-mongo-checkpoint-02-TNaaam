var express = require('express');
var router = express.Router();

var Event = require('../models/Event');
var Remark = require('../models/Remarks');

// edit comment
router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Remark.findById(id, (err, remark) => {
    if (err) return next(err);
    res.render('updateRemark', { remark });
  });
});

// update comment

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Remark.findByIdAndUpdate(id, req.body, (err, updatedRemark) => {
    if (err) return next(err);
    res.redirect('/events/' + updatedRemark.eventId);
  });
});

// increment likes

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  Remark.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, remark) => {
    if (err) return next(err);
    res.redirect('/events/' + remark.eventId);
  });
});

// decrement likes
router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id;
  Remark.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, (err, remark) => {
    if (err) return next(err);
    res.redirect('/events/' + remark.eventId);
  });
});

// delete router

router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Remark.findByIdAndDelete(id, req.body, (err, remark) => {
    if (err) return next(err);
    Event.findByIdAndUpdate(
      remark.eventId,
      { $pull: { remark: remark._id } },
      (err, event) => {
        if (err) return next(err);
        res.redirect('/events/' + remark.eventId);
      }
    );
  });
});

module.exports = router;