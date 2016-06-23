
/*
 * GET home page.
 */

//Load projects as JSON.
var ob = require('../simple.json');

exports.index = function(req, res){  
  res.render('index', { title: 'Express' , oblist: ob });
  };