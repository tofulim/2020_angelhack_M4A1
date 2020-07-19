module.exports = (sequelize, DataTypes) => {
  return sequelize.define('creditlist', {
    credit_number : { //선결제한 고유번호
      type : DataTypes.INTEGER(10),
      allowNull : false,
      primaryKey : true,
      autoIncrement : true,
    },
    hid : { //가게의 고유 번호
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    uid : {//선결제한 손님의 id
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    money: { //선결제 잔액
      type : DataTypes.INTEGER(10),
      allowNull : false,
      defaultValue : 0,
    }
  })
};
