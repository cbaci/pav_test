
/*
 * GET home page.
 */

//Load projects as JSON.
var ob = require('../complex.json');

console.log(ob);
console.log(ob[0].id);
console.log(ob[0].dock.length);

exports.list = function(req, res){  
  res.render('projects', { title: 'Projects' , local: 'test' , oblist: ob });
  };