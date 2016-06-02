
/*
 * GET home page.
 */

//Load projects as JSON.
var ob = require('../simple.json');

console.log(ob);
console.log(ob.colorsArray);
console.log(ob.colorsArray[1].colorName);

exports.index = function(req, res){  
  res.render('index', { title: 'Express' , local: 'test' , oblist: ob });
  };