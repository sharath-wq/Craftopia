const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/userModel");

passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "Email not registered" });
            }

            if (user && (await user.isPasswordMatched(password))) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Invalid Credentials" });
            }
        } catch (error) {
            done(error);
        }
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
