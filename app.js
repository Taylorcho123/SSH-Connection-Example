const express = require('express');
const { Client } = require('ssh2');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/connect-ssh', (req, res) => {
  const { command } = req.body;

  const sshClient = new Client();
  const sshConfig = {
    host: 'your-remote-server.com',
    port: 22,
    username: 'your-username',
    password: 'your-password',
  };

  sshClient.on('ready', () => {
    console.log('SSH connection established');

    sshClient.exec(command, (err, stream) => {
      if (err) throw err;

      let output = '';

      stream
        .on('close', (code, signal) => {
          console.log(`Stream closed with code: ${code}, signal: ${signal}`);
          sshClient.end();
          res.send(output);
        })
        .on('data', (data) => {
          output += `STDOUT: ${data}<br>`;
        })
        .stderr.on('data', (data) => {
          output += `STDERR: ${data}<br>`;
        });
    });
  }).on('error', (err) => {
    console.error(`SSH connection error: ${err}`);
    res.status(500).send(`SSH connection error: ${err}`);
  }).connect(sshConfig);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
