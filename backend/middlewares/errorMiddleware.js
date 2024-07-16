const errorHandler = (err,req,res,next) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;
    return res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}
export {errorHandler};