module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
        indexes: [
            // Create a unique index on email
            {
                unique: true,
                fields: ['email']
            }
        ]
    });
    return User;
  };