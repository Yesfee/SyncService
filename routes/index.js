var express = require('express');
var router = express.Router();
var AESCrypto = require('../class/common/AESCrypto')

/* GET home page. */
router.get('/', function (req, res, next) {

  var keyStr = "6b3324553431d8175f5632ded7874d1d";
  var ivStr = keyStr.substring(0, 16); //"2000000916311611";
  var content = "我是中国人，abcd";

  var encContent = AESCrypto.encrypt(content, keyStr, ivStr);
  //encContent = "Gghud88qAJei0LTl3h96ln/Orh6u4xQ7R7t7EEpcPeE=";

  var decContent = AESCrypto.decrypt(encContent, keyStr, ivStr);
  console.log(decContent);

  res.render('index', { title: 'SyncService' });
});

module.exports = router;
