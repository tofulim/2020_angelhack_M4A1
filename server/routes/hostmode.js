var express = require('express');
var router = express.Router();
const db = require('./mysql');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Sequelize = require('sequelize');

const { User, Creditlist, Receiptlist, Host } = require('../models');
const Op = Sequelize.Op;

fs.readdir('uploads', function(error) {
  if (error) {
    console.log('uploads 폴더가 없으므로 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
})

const upload = multer({
  storage : multer.diskStorage({
    destination(req, file, cb){
      cb(null, 'uploads/');
    },
    filename : function(req, file, cb) {
      const ext = path.extname(file.originalname);  // 확장자(ex : .jpg)
      cb(null, path.basename(file.originalname, ext) + ext); // 확장자 전까지 이름에 확장자를 추가해줌.
    }
  }),
  // limits : {filesize : 5 * 1024 * 1024} //5MB까지 크기 제한인데 필요할까?
});

router.post('/charge_point', function(req, res, next) { //포인트 차감 확인
  //req : uid(가게 사장 id)

  Creditlist.findAll({
    where : { hid : req.body.hid }
  }).then(result => {
    if(result == null) {
      var temp = {"name" : "nothing"};
      temp = JSON.parse(JSON.stringify(temp));
      res.send(temp);
    }; //만약 선결제 해놓은 사람이 아무도 없으면 nothing을 출력함

    var cnumlist = []; //해당 hid 의 가게에 결제한 credit_number 배열 선언
    for (var i in result){
      cnumlist.push(result[i].credit_number); //해당 가게에 선결제한 credit number들을 하나씩 찾아줌
    }
    Receiptlist.findAll({
      raw : true,
      where : { credit_number : { [Op.in] : cnumlist} },
      order : [ ['createdAt', 'DESC'] ],
      limit : 4
    }).then(result2 => {
      console.log('result2 : ', result2);
      var cnum = result2[0].credit_number; // 이걸로 uid 찾아야함
      var uid_search; // 가장 최근에 결제한 고객의 id
      var uname = "";
      var tmp;
      Creditlist.findOne({
        raw : true,
        where : { credit_number : cnum }
      }).then((result3) => {
        tmp = result3;
        uid_search = tmp.uid;
        User.findOne({
          raw : true,
          where : { uid : uid_search }
        }).then((result4) => {
          tmp = result4;
          var usage_history = result2.filter(a => a.credit_number == cnum);
          uname = tmp.name;
          var data = {"name" : uname, "usage_history" : usage_history};
          data = JSON.parse(JSON.stringify(data));
          res.send(data);
        })
      });
    })//res : name(이름), usage_history[{before_money, used_money, createdAt}](사용내역 객체배열)
  });
});

router.post('/mypage', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/mypage/save', upload.single('qr'), function(req, res, next) { //가게 등록하기 페이지
  //req : uid(사장 id), storename(가게이름), introduceText(가게 설명), qr코드 ,가게주소(아직은 ㄴㄴ)

    ////////////////////////////
    //        QR코드 받은거 저장 후 경로 설정 & 멀터
    ////////////////////////////
    var temp = JSON.parse(req.body.json);
    console.log('temp : ', temp);
    Host.create({
      uid : temp.uid,
      introduceText : temp.introduceText,
      storename : temp.storename,
      qrcode : req.file.path
    });
  res.send("nothing");
}); //res : 보낼게 없음

router.post('/mypage/modified', upload.single('qr'), function(req, res, next) { //가게 수정 사항 저장, QR코드 바뀜, 새로 생성
  //req : uid(사장 id), storename(가게이름), introduceText(가게 설명), 가게주소(아직은 ㄴㄴ), qrcode(새로 만든 큐알)

  ////////////////////////////
  //        QR코드 받은거 저장 후 경로 설정 & 멀터
  //        기존 QR코드 삭제
  ////////////////////////////

  Host.findOne({ // 삭제할 기존의 QR코드의 이름을 찾음.
    raw : true,
    attributes : ['qrcode'],
    where :
      { uid : req.body.uid,
        storename : req.body.storename }
  }).then(result => {
    console.log('result : ', result);
    if (result != null) {
      var delete_name = result[0].qrcode;
      delete_name = delete_name.substr(8);
      fs.unlinkSync("uploads/" + delete_name); // uploads 폴더에 있는 기존 QR코드 파일을 지움
    }
    Host.update({ // DB에서 가게 정보 수정. (QR을 포함해서 다른 것도)
      introduceText : req.body.introduceText,
      storename : req.body.storename,
      qrcode : req.file.path
      }, {
        where : { uid : req.body.uid, storename : req.body.storename }
    });
    var temp = {"msg" : "nothing"};
    temp = JSON.parse(JSON.stringify(temp));
    res.send(temp);
  })
}); //res : 보낼게 없음

router.post('/creditlist', async function(req, res, next) {
  // req : hid(사장 아이디)
  var clist = await Creditlist.findAll({ //내림차순으로 최근 선결제한 사람부터 0번인덱스 정렬
    raw : true,
    order : [['credit_number', 'DESC']],
    where : { hid : req.body.hid }
  });
  clist = JSON.parse(JSON.stringify(clist));
  for(let i in clist) {
    var ttt = await User.findOne({
      raw : true,
      where : { uid : clist[i].uid }
    });
    ttt = JSON.parse(JSON.stringify(ttt));
    clist[i].name = ttt.name;
    console.log(clist[i]);
  } // user 뒤져서 Creditlist에 name을 추가해줌
  console.log("last:", clist);
  var temp = clist;
  temp = JSON.parse(JSON.stringify(clist));
  console.log('temp : ', temp);
  // console.log('result2 : ', result2);
  res.send(clist);
   //res : {name(이름), money(선결제 잔액)}
});

//router.post('/mypage/qrcallup', function(req, res, next) { //QR코드 불러오기 클릭했을 때, 필요없을듯
  //req : uid()사장 id)

  //////////////////////////////
  // upload 폴더에 uid로 사진 찾아서 경로만 알려주면 될//
  /////////////////////////////


module.exports = router;
