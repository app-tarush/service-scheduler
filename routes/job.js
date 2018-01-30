var express = require("express");
var router = express.Router();

// import controllers
var jobController = require("../controller/jobController");

/** POST a job request to schedule metrics collection. **/
router.post('/schedule', jobController.schedule);

/*** GET request to find jobs detail. **/
router.get('/list', jobController.jobs);

/*** GET request to find a particular job details using job name. ***/
router.get('/search/:name', jobController.findJob);

/** DELETE request to cancel a job running **/
router.delete('/cancel/:name', jobController.cancel);

router.post('/schedule/once', jobController.scheduleOnce);

router.post('/schedule/now', jobController.scheduleNow);


module.exports = router;