module.exports = (sequelize, DataTypes) => {
  return sequelize.define('host', {
    host_number : { //가게의 고유번호
      type : DataTypes.INTEGER(11),
      allowNull : false,
      primaryKey : true,
      autoIncrement : true,
    },
    storename : { //가게 상호명
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    uid : { //가게 사장의 uid
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    introduceText: { //가게 소개글
      type : DataTypes.STRING(100),
      allowNull : true,
    },
    qrcode : { //가게 QR코드
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  })
};
