const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { registerHelper } = require("handlebars");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: { type: String },
  email: { type: String },
  loginHistory: [
    {
      dateTime: { type: Date },
      userAgent: { type: String },
    },
  ],
});

let User;

// Exported Function
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://tqknguyen:HCnXyzth6LV8EjJl@projectcluster.knexhbz.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password === userData.password2) {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;
        })
        .then(() => {
          var newUser = new User(userData);
          newUser
            .save()
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              if (err.code == 11000) reject("User Name already taken");
              else reject("There was an error creating the user: " + err);
            });
        })
        .catch((err) => {
          reject("There was an error encrypting the password");
        });
    } else {
      reject("Passwords do not match");
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        users = users.map((value) => value.toObject());
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((result) => {
              if (result === false) {
                reject(`Incorrect Password for user: ${userData.userName}`);
              } else {
                users[0].loginHistory.push({
                  dateTime: new Date(),
                  userAgent: userData.userAgent,
                });
                User.updateOne(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } }
                )
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                  });
              }
            });
        }
      })
      .catch(() => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
};
