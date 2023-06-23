const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name can not exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    Validite: [validator.isEmail, "Please Enter Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be grater than 8 characters"],
    select: false,
  },
  avtar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  role: { type: String, default: "user" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save",async function (next){

  if (!this.isModified("password")) {
    next();
  }
    this.password = await bcrypt.hash(this.password,10)
});

// JWT TOKEN
userSchema.methods.getJWTToken = function() {
   return jsonwebtoken.sign({id:this._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRE
   })
}

// Compare Password
userSchema.methods.comparePassword = async function(enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password)
}


//Genrating Password reset Token ////////////////////////////////////////
userSchema.methods.getResetPasswordresetToken = function () {

  //Genrating token
  const resetToken = crypto.randomBytes(20).toString("hex");


  // hashing and adding to userschema
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).toString("hex");

  this.resetPasswordExpire = Date.now() + 15*60*1000;

  return resetToken;

}

module.exports = mongoose.model("User",userSchema);
