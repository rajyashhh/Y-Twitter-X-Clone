import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = async (userId, sessionVersion, res) => {
    const token = jwt.sign(
        { userId, sessionVersion },
        process.env.JWT_SECRET,
        {
            expiresIn: '10d'
        }
    );
    res.cookie("jwt", token, {
        maxAge: 10 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development"
    });
};