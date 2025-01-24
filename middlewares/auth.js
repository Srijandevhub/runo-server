const jwt = require('jsonwebtoken');
const user_secret = process.env.TOKEN_SECRET;
const refresh_secret = process.env.REFRESH_SECRET;
const Article = require('../models/articleModel');

const userAuth = (req, res, next) => {
    const userToken = req.cookies.runousertoken;
    const refreshToken = req.cookies.runorefreshtoken;
    if (!userToken && !refreshToken) {
        return res.status(403).json({ message: "Access denied" });
    }
    if (userToken) {
        jwt.verify(userToken, user_secret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Access denied" });
            }
            req.user = user;
            next();
        })
    } else {
        if (refreshToken) {
            jwt.verify(refreshToken, refresh_secret, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Access denied" });
                }
                const token = jwt.sign({ userid: user.userid, role: user.role }, process.env.TOKEN_SECRET, { expiresIn: '1d' });
                res.cookie("runousertoken", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                req.user = user;
                next();
            })
        }
    }
}

const articleAuth = async (req, res, next) => {
    try {
        const userToken = req.cookies.runousertoken;
        const refreshToken = req.cookies.runorefreshtoken;
        const { id } = req.params;

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (article.isarchieved) {
            if (!userToken && !refreshToken) {
                return res.status(401).json({ message: "Access denied: No tokens provided" });
            }

            let user;
            if (userToken) {
                try {
                    user = jwt.verify(userToken, process.env.TOKEN_SECRET);
                } catch (err) {
                    return res.status(401).json({ message: "Access denied: Invalid or expired user token" });
                }
            } else if (refreshToken) {
                try {
                    user = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
                    const newToken = jwt.sign(
                        { userid: user.userid, role: user.role },
                        process.env.TOKEN_SECRET,
                        { expiresIn: '1d' }
                    );
                    res.cookie("runousertoken", newToken, {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: true,
                        sameSite: 'Strict',
                    });
                } catch (err) {
                    return res.status(401).json({ message: "Access denied: Invalid or expired refresh token" });
                }
            }

            if (user.userid.toString() !== article.userid.toString()) {
                return res.status(403).json({ message: "Access denied: Insufficient permissions" });
            }
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while processing the request" });
    }
};

const articleAuth2 = async (req, res, next) => {
    try {
        const userToken = req.cookies.runousertoken;
        const refreshToken = req.cookies.runorefreshtoken;
        const { id } = req.params;

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (!userToken && !refreshToken) {
            return res.status(401).json({ message: "Access denied: No tokens provided" });
        }

        let user;
        if (userToken) {
            try {
                user = jwt.verify(userToken, process.env.TOKEN_SECRET);
            } catch (err) {
                return res.status(401).json({ message: "Access denied: Invalid or expired user token" });
            }
        } else if (refreshToken) {
            try {
                user = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
                const newToken = jwt.sign(
                    { userid: user.userid, role: user.role },
                    process.env.TOKEN_SECRET,
                    { expiresIn: '1d' }
                );
                res.cookie("runousertoken", newToken, {
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: true,
                    sameSite: 'Strict',
                });
            } catch (err) {
                return res.status(401).json({ message: "Access denied: Invalid or expired refresh token" });
            }
        }

        if (user.userid.toString() !== article.userid.toString()) {
            return res.status(403).json({ message: "Access denied: Insufficient permissions" });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while processing the request" });
    }
};

module.exports = { userAuth, articleAuth, articleAuth2 };