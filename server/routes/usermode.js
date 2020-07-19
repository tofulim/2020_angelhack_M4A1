var express = require('express');
var router = express.Router();
var db = require('./mysql');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const { User, Creditlist, Receiptlist, Host } = require('../models');
const Op = Sequelize.Op;

router.post('/qrscan', function(req, res, next) { //QR스캔할 때
  //req : hid(사장 id), uid(사용자 id)
  Creditlist.findOne({
    raw : true,
    where : {
      uid : req.body.uid,
      hid : req.body.hid
    }
  }).then(result => { // 돈만 보내줌
    if (result == null) result = 0; //해당 가게에 선결제 내역이 없는경우 예외처리
    else result = result.money;
    result = JSON.parse(result);
    res.send(`{"money" : ${result}}`);
  })// res : money(잔여 포인트 전송) default = 0;
});

router.post('/payment_save', function(req, res, next) { //선결제 금액 저장
  //req : hid(사장 id),uid(사용자 id), money(확정된 결제금액)
  Creditlist.findOne({
    raw : true,
    where : {
      uid : req.body.uid,
      hid : req.body.hid //가게 고유번호가 넘겨준 host객체의 number와 같아야 함
    }
  }).then(result => {
    if(result == null) {  //내역이 없는 신규 선결제 사용자일 경우
      Creditlist.create({
        hid : req.body.hid, // "고객 ID"의 형태로 나옴. 사장 ID가 나와야함.
        uid : req.body.uid, // 현재 로그인한 고객 ID 나옴.
        money: req.body.money
      })
      res.send(`{"money" : ${req.body.money}}`);
    }
    else {
      Creditlist.increment({ money : req.body.money },
        { where :
          { uid : req.body.uid,
            hid : req.body.hid }
      });
      var totalmoney = result.money + req.body.money;
      res.send(`{"money" : ${totalmoney}}`);
    }
  })// res : money (결제 후 합산잔액)
});

router.post('/subtract_request', function(req, res, next) { //차감요청, receipt 에 저장 및 현재 잔액 표시
  //req : hid(가게 주인 id), uid(유저 id), before_money(차감전금액), used_money(사용한 금액),
  console.log('req.body : ', req.body);
  Creditlist.findOne({
    raw : true,
    where :
    { hid: req.body.hid,
      uid : req.body.uid, }
  }).then(result => {
    if (result == null) {
      var temp = `{"msg" : "nothing"}`;
      temp = JSON.parse(JSON.stringify(temp));
      res.send(temp);
    } //msg 내역이 없어서 그냥 끝냄
    else {
      var creditnumber = result.credit_number;
      var remain_money = result.money - req.body.used_money;
      Creditlist.update({ //잔액 업뎃해줌
        money : remain_money},
        { where :
          { hid: req.body.hid,
            uid : req.body.uid }
      });
      Receiptlist.create({ //영수중에 추가해줌
        credit_number : creditnumber,
        before_money: result.money,
        used_money: req.body.used_money
      });
      res.send(`{"money" : ${remain_money}}`);
    }
  }) //res :  따로 보내는 것이 없음
});

router.post('/point_receipt', async function(req, res, next) { //사용한 내역, 선결제한 내역이 있다는 전제 하에 실행
  //req : uid(유저 id)
  var credit = await Creditlist.findAll({
    raw : true,
    where : { uid : req.body.uid },
  });
  if(credit == null) {
    var msg = {"msg" : "nothing"};
    msg = JSON.parse(JSON.stringify(msg));
    res.send(msg);
  }
  credit = JSON.parse(JSON.stringify(credit));
  console.log('credit : ', credit);
  for(var i in credit) {
    var temp = await Host.findAll({
      raw : true,
      where : { uid : credit[i].hid }
    });
    temp = JSON.parse(JSON.stringify(temp));
    credit[i].storename = temp[i].storename;
    console.log(`credit[${i}] : `, credit[i]);
  }
  console.log('for문 밖 credit : ', credit);
  var tmp = JSON.parse(JSON.stringify(credit));
  console.log('tmp : ', tmp);
  res.send(tmp);
  //res : receiptlist table을 최근 3건까지만 전달함, (before_money, used_money, timestamp) 를 사용하면 될듯함
});

router.post('/creditstorelist', function(req, res, next) { //입점한 가맹점 리스트
  //req : uid(사용자 id)
  Creditlist.findAll({
    raw : true,
    order: [['credit_number', 'ASC']],
    where : { uid : req.body.uid } //유저가 결제한 모든 가게 리스트를 뽑아옴
  }).then(result => {
    result = JSON.parse(JSON.stringify(result));
    res.send(result);
  }) //res : 사용자가 선결제한 시간에 대한 오름차순으로, creditlist를 리턴
});

module.exports = router;
