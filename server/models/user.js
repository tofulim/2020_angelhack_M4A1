module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    number : {
      type : DataTypes.INTEGER(11),
      allowNull : false,
      primaryKey : true,
      autoIncrement : true,
    },
    name : {
      type : DataTypes.STRING(40),
      allowNull : false,
    },
    uid : {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  })
};
