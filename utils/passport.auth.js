const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/userModel");
const { findOneAndReplace } = require("../models/categoryModel");
const passwordGenerator = require("password-generator");
const { v4: uuidv4 } = require("uuid");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/google/callback",
            passReqToCallback: true,
        },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                const existinguUser = await User.findOne({ email: profile.email });

                if (existinguUser) {
                    return done(null, existinguUser);
                }

                const newUser = await User.create({
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    image: profile.picture,
                    mobile: "phone" + uuidv4(),
                    password: passwordGenerator(12, false),
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: "Email not registered" });
            }

            const isPasswordValid = await user.isPasswordMatched(password);
            if (!isPasswordValid) {
                return done(null, false, { message: "Invalid Credentials" });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
});

module.exports = passport;
