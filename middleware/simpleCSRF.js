const checkCSRFHeader = (req, res, next) => {
    if (["POST","PATCH","PUT","DELETE","CONNECT"].includes(req.method)) {
        if (req.get("X_CSRF_TOKEN" != req.user.csrfToken))
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ message: "Bad Request." });
    }
    next();
}