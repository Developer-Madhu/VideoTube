const asyncHandler = (reqHandler) => {
    return (req,res,next) => {
        Promise.resolve(reqHandler(res,req,next))
        .catch((err) => next())
    }
}

export {asyncHandler}