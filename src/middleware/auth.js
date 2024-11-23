import DFramework from '../DFramework.js';
import { logger } from '@durlabh/dframework';
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = "457474974443767";

class UserAuthentication {

    static slidingExpiry = true;

    static expiresIn = "1h";

    static hashPassword(password) {
        const sha = crypto.createHash("sha1");
        sha.update(password);
        return sha.digest("hex");
    }

    static generateToken = ({ user, expiresIn = UserAuthentication.expiresIn }) => {
        return jwt.sign(user, SECRET_KEY, { expiresIn })
    }

    static verify = (token) => {
        let userId = null;
        try {
            ({ userId } = jwt.verify(token, SECRET_KEY));
        } catch {
            return;
        }
        return UserAuthentication.getUser({ userId });
    }

    static async getUser({ username, password, userId }) {
        const where = {};
        if (userId && userId !== 0) {
            where.UserId = userId;
        } else if (username?.length > 1 && password.length > 4) {
            where.EmailAddress = username;
            where.PasswordHash = UserAuthentication.hashPassword(password);
        } else {
            return
        }
        const { data } = await DFramework.sql.execute({
            query: `SELECT * FROM dbo.Security_User`,
            where
        })
        if (data.length) {
            const { PasswordHash, ...user } = data[0];
            return user;
        }
    }
}

const auth = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        const user = await UserAuthentication.getUser({ username, password });
        if (user) {
            const cookiesValue = UserAuthentication.generateToken({ user });
            res.cookie("auth", cookiesValue, {
                path: "/", httpOnly: false, secure: false, sameSite: "strict", maxAge: rememberMe ? 365 * 24 * 60 * 60 * 1000 : undefined,
                expires: rememberMe ? undefined : false,
            })
            req.user = user;
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message })
    }
}

const authenticateUser = async (req, res, next) => {
    try {
        const cookiesValue = req.cookies.auth;
        if (cookiesValue) {
            const user = await UserAuthentication.verify(cookiesValue);
            if (user) {
                req.user = user;
                return next();
            }
        }
    } catch (err) {
        logger.error(err);
        return res.status(400).json({ error: "Unauthorized" })
    }
}

export { auth, authenticateUser };