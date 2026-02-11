import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

/* -----------------DEFINING THE SCHEMA FOR AN USER----------------- */
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
})

/* -----------------CREATING METHODS FOR THE USER'S MODEL----------------- */
// These methods that we're creating are just like .create() or .findById()

// Static signup method
// We use async because we will handle all of the signup logics
// If we use "this" keyword, we can't use arrow function. Otherwise, it won't work
userSchema.statics.signup = async function(email, password) {
    // validation
    if (!email || !password) {
        throw Error("All fields must be filled!");
    }
    if (!validator.isEmail(email)) {
        throw Error("Email is not valid!");
    }
    if (!validator.isStrongPassword(password)) {
        throw Error("Password is not strong enough!");  
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use!");
    }

    // Salt is like the random part after the hashed password
    // So if the whole pw is "passwordjklmnp012" then hashed is "password" and salt is "jkl..."
    // This is to add an extra layer of security so if a hacker cracks one then it doesn't mean he cracks others
    // The bigger the argument, the more secured but also longer (in time and length) that this password will be
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Create an user document in the database
    const user = await this.create({ email, password: hash });

    return user;
}


// Static login method that compares the credentials the user types to the ones in database
userSchema.statics.login = async function(email, password) {
    // validation
    if (!email || !password) {
        throw Error("All fields must be filled!");
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw Error("Incorrect Email");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw Error("Incorrect password");
    }

    return user
}

/* -----------------CREATING AND RETURNING THE MODEL----------------- */ 
const Users = mongoose.model('Users', userSchema);

export default Users;