const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const yup = require("yup");
const fs = require("fs");

const app = express();
app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/db", express.static(__dirname + "/db"));
app.use(express.static(__dirname + "/db"));
// app.use(express.bodyParser());

const port = 3030;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const schema = yup.object().shape({
  id: yup
    .string()
    .trim()
    .matches(/[a-zA-Z0-9]/)
    .required(),
  players: yup.array().length(2),
  wins: yup.array().length(2),
  scores: yup.array().length(2),
  pSide: yup.array().length(2),
});
app.post("/upload", async (req, res, next) => {
  const { id, players, wins, scores, pSide } = req.body;
  try {
    await schema.validate({
      id,
      players,
      wins,
      scores,
      pSide,
    });

    const filePath = `${__dirname}/db.json`;

    var db = JSON.parse(fs.readFileSync(filePath));
    db[id] = {
      players,
      wins,
      scores,
      pSide,
      ts: Date.now(),
    };
    fs.writeFileSync(filePath, JSON.stringify(db));

    res.json({
      id,
    });
  } catch (error) {
    next(error);
  }
  // res.send("Hello World!");
});
app.get("/getInfo/:id?", async (req, res, next) => {
  const id = req.params.id;
  try {
    const filePath = `${__dirname}/db.json`;
    var data = JSON.parse(fs.readFileSync(filePath))[id];
    data.id = id;
    res.json(data);
  } catch (error) {
    next(error);
  }
  // res.send("Hello World!");
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
