const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { roles } = require("../utils/constants");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            default: "",
        },
        mobile: {
            type: String,
            required: true,
        },
        isMobileVerified: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        cart: {
            type: Array,
            default: [],
        },
        role: {
            type: String,
            enum: [roles.user, roles.admin, roles.superAdmin],
            default: roles.user,
        },
        address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetTokenExpires: Date,
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (this.email === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.superAdmin;
    }
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
