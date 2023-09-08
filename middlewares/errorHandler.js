const notFound = (req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
    res.statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.statusCode(statusCode);
    res.json({
        status: "fail",
        message: err?.message,
        stack: err?.stack,
    });
};

module.exports = { errorHandler, notFound };
