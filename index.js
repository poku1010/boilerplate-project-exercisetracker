const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// 記憶體中的資料儲存
let users = [];
let exercises = [];

// 中介軟體
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// 根路徑
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// 建立新使用者
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: Date.now().toString(), // 使用 timestamp 當作唯一 ID
  };
  users.push(newUser);
  res.json(newUser);
});

// 取得所有使用者列表
app.get('/api/users', (req, res) => {
  res.json(users);
});

// 新增運動記錄
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: _id,
  };

  exercises.push(exercise);
  res.json(exercise);
});

// 取得使用者運動日誌
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let userExercises = exercises.filter(ex => ex._id === _id);

  // 依據日期篩選日誌
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  // 根據 limit 篩選
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: _id,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  });
});

// 啟動伺服器
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
