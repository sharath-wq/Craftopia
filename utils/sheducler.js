const Schedule = require("node-schedule");
const OrderItem = require("../models/orderItemModel");

function scheduleOrderItemUpdateJob() {
    const rule = new Schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    rule.hour = [0, 12];

    Schedule.scheduleJob(rule, async function () {
        await OrderItem.updatePendingOrdersStatus();
    });
}

module.exports = { scheduleOrderItemUpdateJob };
