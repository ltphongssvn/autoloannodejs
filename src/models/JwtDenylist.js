// src/models/JwtDenylist.js
// Maps: app/models/jwt_denylist.rb
import { DataTypes, Op } from 'sequelize';

export default (sequelize) => {
  const JwtDenylist = sequelize.define(
    'JwtDenylist',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      jti: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      exp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'jwt_denylists',
      underscored: true,
      timestamps: false,
    },
  );

  JwtDenylist.isDenylisted = async function (jti) {
    const entry = await JwtDenylist.findOne({ where: { jti } });
    return !!entry;
  };

  JwtDenylist.addToList = async function (jti, exp) {
    return JwtDenylist.create({ jti, exp: new Date(exp * 1000) });
  };

  JwtDenylist.cleanup = async function () {
    return JwtDenylist.destroy({
      where: { exp: { [Op.lt]: new Date() } },
    });
  };

  return JwtDenylist;
};
