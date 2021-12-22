import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import path from 'path';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import websocketRouter from './routes/websocket.js'
import leaderboardRouter from './routes/leaderboard.js'

var app = express();
//enableWs(app)gameStatus

import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/socket', websocketRouter)
app.use('/leaderboard', leaderboardRouter)

// send the target building if requested
app.get('/getTargetBuilding', function (req, res) {
  res.send(game.hiderBuilding)
})

export default app;