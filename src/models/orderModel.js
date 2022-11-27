module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      promotion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notEmpty: {
            msg: "promotion field cannot be empty",
          },
          isIn: {
            args: [["true", "false"]],
            msg: "Promotion is boolean , choose true or false",
          },
        },
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
        validate: {
          isInt: {
            msg: "The quantity must be an integer",
          },
          min: {
            args: [1],
            msg: "The quantity cannot be under 0",
          },
          max: {
            args: [100],
            msg: "The quantity cannot be superior to 100",
          },
        },
      },
      //calculation method
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
        set: function (price) {
          if (this.quantity > 50) {
            if (this.promotion === true) {
              this.setDataValue("price", Math.round(this.quantity * 9 * 0.8));
            } else {
              this.setDataValue("price", Math.round(this.quantity * 9));
            }
          } else if (this.promotion === true) {
            this.setDataValue("price", Math.round(this.quantity * 15 * 0.8));
          } else {
            this.setDataValue("price", Math.round(this.quantity * 15));
          }
        },
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "In_Order",
      },
    },
    {
      timestamps: true,
      createdAt: false,
      updatedAt: false,
    }
  );

  return Order;
};
