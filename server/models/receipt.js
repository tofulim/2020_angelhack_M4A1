module.exports = (sequelize, DataTypes) => {
  return sequelize.define('receiptlist', {
    number : {
      type : DataTypes.INTEGER(10),
      allowNull : false,
      primaryKey : true,
      autoIncrement : true,
    },
    credit_number : { //선결제한 고유번호 받아와서 사용
      type : DataTypes.INTEGER(10),
      allowNull : false,
    },
    before_money: { //선결제 잔액
      type : DataTypes.INTEGER(10),
      allowNull : false,
    },
    used_money: { //차감한 금액
      type : DataTypes.INTEGER(10),
      allowNull : false,
    },
  },
  {
    timestamps : true, // true -> createdAt, updatedAt column생성
  },
)};
