const express = require('express');
const app = express();
const port = 1939;

const pgp = require('pg-promise')();
const db = pgp('postgres://app:zxc7v4321@localhost:5432/schooldb');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}))

app.get('/', (req, res) => {
  let students = db.any('SELECT * FROM Students;')
    .then(students => {
      res.send(students);
    })
    .catch(e => console.error(e));
})

app.get('/posts', (req, res) => {
  db.any('SELECT\n' +
    '    posts.id,\n' +
    '    posts.text,\n' +
    '    CONCAT(students.FirstName, \' \', students.LastName) AS author_name,\n' +
    '    students.handle AS author_handle,\n' +
    '    posts.likes,\n' +
    '    posts.date,\n' +
    '    JSON_AGG(JSON_BUILD_OBJECT(\'author\', CONCAT(students.FirstName, \' \', students.LastName), \'text\', comments.Text)) AS comments\n' +
    'FROM\n' +
    '    posts\n' +
    'LEFT JOIN\n' +
    '    comments ON posts.id = comments.ParentId\n' +
    'LEFT JOIN\n' +
    '    students ON posts.author = students.id\n' +
    'GROUP BY\n' +
    '    posts.id,\n' +
    '    posts.text,\n' +
    '    posts.likes,\n' +
    '    posts.date,\n' +
    '    author_name,\n' +
    '    author_handle\n' +
    'ORDER BY\n' +
    '    posts.date DESC;\n')
    .then(posts => {
      console.log('Posts were required')
      res.send(posts)
    })
    .catch(e => console.error(e))
})

app.get('/grades', (req, res) => {
  let student = req.query.student;
  // let token = req.query.token;
  // TODO implement token authorization

  if (student === undefined || student === null) {
    res.status(400)
    res.send("Specify StudentId")
  } else {
    db.query(`SELECT * FROM Grades WHERE StudentId=${student}`)
      .then((grades) => {
        res.send(grades);
      })
  }
})

app.post('/submit_post', (req, res) => {
  const {student, post} = req.body;

  if (!student || !post) {
    return res.status(400).send("Invalid request: Missing student or post data");
  }

  db.query(`INSERT INTO Posts (Author, Text, Likes, Date) VALUES (${student}, '${post}', 0, CURRENT_TIMESTAMP);`)
    .then(() => {
      console.log('Post inserted successfully');
      return res.send("Post Submitted");
    })
    .catch((err) => {
      console.error('Error inserting post:', err);
      return res.status(500).send("Error submitting post");
    });
});

app.post('/submit_comment', (req, res) => {
  const { parentId, author, text } = req.body;

  console.log(req.body);

  db.query('INSERT INTO Comments (parentid, author, text) VALUES ($1, $2, $3);', [parentId, author, text])
    .then(() => {
      console.log('A comment was submitted');
      return res.send('The comment was submitted');
    })
    .catch((error) => {
      console.error('Error submitting comment:', error);
      return res.status(500).send('Error submitting the comment');
    });
});

app.post('/like_post', (req, res) => {
  const { postId } = req.body;

  console.log(postId);

  db.query(`UPDATE Posts SET Likes = Likes + 1 WHERE Id = ${postId};`)
    .then(() => {
      console.log('Post was liked');
      return res.send('Post was liked');
    })
})

app.post('/dislike_post', (req, res) => {
  const { postId } = req.body;

  db.query(`UPDATE Posts SET Likes = Likes - 1 WHERE Id = ${postId};`)
    .then(() => {
      console.log('Post was disliked');
      return res.send('Post was disliked');
    })
})

app.get('/avg_grade', (req, res) => {
  const student = req.query.student;

  db.query('')
})

app.listen(port, () => {
  console.log(`The school server is up and listening on port ${port}`);
})