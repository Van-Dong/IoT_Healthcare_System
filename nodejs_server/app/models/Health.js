const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const health = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        sex: Number,
        chestpaintype: Number,
        age: Number,
        height: Number,
        weight: Number,
        sysbp: Number,
        diabp: Number,
        cholesterol: Number,
        glucose: Number,
        cigsperday: Number,
        exercise_angina: Number,
        prevalent_stroke: Number,
        prevalent_hyp: Number,
        bp_meds: Number,
        diabetes: Number,
    },
    {
        timestamps: true,
    },
);


module.exports = mongoose.model('Health', health);
