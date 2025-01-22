const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const databaseConfig = require('./config/databaseConfig');
const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5174", "http://localhost:5173"], methods: ["POST", "GET", "PUT", "DELETE"], credentials: true }));
app.use(cookieParser({ origin: ["http://localhost:5174", "http://localhost:5173"] }));
const port = process.env.PORT;
const url = process.env.MONGO_URL;
databaseConfig(url);

app.use("/uploads", express.static(path.join(__dirname, "./uploads/")));

app.use("/api/v1/user", require('./routes/userRoutes'));
app.use("/api/v1/public", require('./routes/guestRoutes'));
app.use("/api/v1/category", require("./routes/categoryRoutes"));
app.use("/api/v1/tag", require("./routes/tagRoute"));
app.use("/api/v1/article", require("./routes/articleRoutes"));

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});