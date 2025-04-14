const signup = async (req, res) => {
    res.json({
        message: "You hit the signup endpoint"
    });
};
const login = async (req, res) => {
    res.json({
        message: "You hit the login endpoint"
    });
};
const logout = async (req, res) => {
    res.json({
        message: "You hit the logout endpoint"
    });
};

export {signup, login, logout};