var exec = require('child_process').exec;
var http = require('http');
var url = require('url');

const ALLOWED_COMMANDS = ['node -v', 'npm -v'];
function asyncEach(arr, iterator) {
  var i = 0;
  (function iterate() {
    iterator(arr[i++], function () {
      if (i < arr.length)
        process.nextTick(iterate);
    });
  })();
}

function execEach(commands) {
  asyncEach(commands, (command) => {
    exec(command, (error, stdout, stderr) => {
      if (error) console.error(`执行出错: ${error.message}`);
      if (stdout) console.log(`输出: ${stdout}`);
    });
  });
};

require('http').createServer(function(req, res) {
  let cmd = require('url').parse(req.url, true).query.path; // $ Source
  if (cmd && ALLOWED_COMMANDS.includes(cmd)) {
    console.log(`[安全] 执行授权指令: ${cmd}`);
    execEach([cmd]);
    res.end('Command Accepted');
  } else {
    // 拦截所有不匹配的输入（包括 calc.exe）
    console.warn(`[拦截] 发现非法指令: ${cmd}`);
    res.statusCode = 403; // 返回 403 状态码
    res.end('Forbidden: Invalid Command');
  }

}).listen(8080); 
