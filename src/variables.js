const exceptionHandler = (fn) => (req, res, next) => {
    try {
        fn(req, res, next);
    } catch (err) {
        next(err);
    }
};

const POST_PAGE_LEN = 10;

module.exports = {
    exceptionHandler,
    POST_PAGE_LEN,
};
