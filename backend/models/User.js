const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const Tournament = require("./Tournament");
const Participant = require("./Participant"); 

const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      isEmail:{
        msg:"Invalid email format",
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender:{
      type: DataTypes.ENUM("male","female"),
      allowNull: false,
    },
    birthDate:{
      type: DataTypes.DATE,
      allowNull:false,
    }
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.hasMany(Tournament, { foreignKey: 'organizerId' });
Tournament.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

User.hasMany(Participant, { foreignKey: 'userId' });
Participant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = User;
