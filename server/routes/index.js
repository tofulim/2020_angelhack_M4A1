var express = require('express');
var router = express.Router();
const db = require('./mysql');
const Sequelize = require('sequelize');

const { User, Creditlist, Receiptlist, Host } = require('../models');
const Op = Sequelize.Op;

router.post('/user_check', function(req, res, next) { //"사용자로 로그인" 했을 때만 체크할 수 있음
  //req : name(사용자 이름), uid(사용자 id)
  User.findOne({
    raw : true,
    where : { uid : req.body.uid }
  }).then(result => {
    if(result == null) { //user에 없을 때 생성해줌
      User.create({
        name : req.body.name,
        uid : req.body.uid,
      });
    }
    res.send();
  });
});

router.post('/host_check', function(req, res, next) { //"매니저로 로그인" 했을 때만 체크할 수 있음, 로그인 직후의 활동을 규정짓기위함
  //req : uid(사용자 id)
  Host.findOne({
    raw : true,
    where : { uid : req.body.uid }
  }).then(result => {
    if(result == null) { // host에 없을 때 생성해줌 (=QR코드 없는 점)
      var temp = `{"storename" : "nothing"}`;
      temp = JSON.parse(JSON.stringify(temp));
      res.send(temp);
    }
    else { //host에 정보가 있음(= QR코드를 갖고 있는 점주임)
      result = JSON.parse(JSON.stringify(result));
      res.send(result);
    }
  });//QR등록 유무에 따라 {msg : nothing} || {storename,uid(사장 id), introduceText, qrcode (QR주소)} 를 리턴함
});

module.exports = router;
