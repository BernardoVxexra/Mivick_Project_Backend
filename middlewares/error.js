export function error(err, req, res,next) {
    console.error('Erro Middleware:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Erro Interno no servidor";

    res.statusCode(statusCode).json({ 
        success: false,
        error: message,
     });
}