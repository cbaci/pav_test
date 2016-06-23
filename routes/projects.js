
/*
 * GET list of projects.
 */

//Load projects as JSON.
var ob = require('../complex.json');

exports.list = function(req, res){  
  res.render('projects', { title: 'Projects' , oblist: ob });
  };