const OrderItem = require("../models/orderItemModel");

const rule = new Schedule.RecurrenceRule();
rule.hour = 0; // 0 represents midnight, adjust as needed
rule.minute = 0;
rule.second = 0;

Schedule.scheduleJob(rule, async function () {
    await OrderItem.updatePendingOrdersStatus();
});
