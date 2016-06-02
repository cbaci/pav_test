
/*
 * GET home page.
 */

exports.index = function(next, req, res){  
  res.render('index', { title: 'Express' });
  };