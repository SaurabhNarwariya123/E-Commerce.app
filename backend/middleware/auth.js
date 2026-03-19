import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * 
 * Expected header format:
 * Authorization: Bearer <token>
 * 
 * Or custom header (for backward compatibility):
 * token: <token>
 */
const authUser = async (req, res, next) => {
    try {
        // Get token from Authorization header or custom header
        let token = null;

        if (req.headers.authorization) {
            // Standard: Authorization: Bearer <token>
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.slice(7); // Remove 'Bearer ' prefix
            }
        }

        // Fallback: custom header for backward compatibility
        if (!token && req.headers.token) {
            token = req.headers.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Authorization required."
            });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error("CRITICAL: JWT_SECRET is not configured");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.body.userId = decoded.id;
            req.user = decoded; // Add full decoded token to request
            next();
        } catch (jwtError) {
            // Handle specific JWT errors
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired. Please login again.",
                    code: 'TOKEN_EXPIRED'
                });
            }

            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Token signature verification failed.",
                    code: 'INVALID_TOKEN'
                });
            }

            // Generic JWT error
            return res.status(401).json({
                success: false,
                message: jwtError.message,
                code: 'JWT_ERROR'
            });
        }

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

export default authUser;