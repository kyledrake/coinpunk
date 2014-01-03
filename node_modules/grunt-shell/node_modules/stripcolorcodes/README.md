# StripColorCodes

When using libs like [colors](https://github.com/marak/colors.js/) your
shell is beautifull but if you store the result in a file, it's not so
good :-/

    $ vim myLog
    
    20120413045946 ^[[34mdebug:  ^[[39m […n/my-service] Starting my-service on 0.0.0.0:8080 in dev mode·
    20120413045946 ^[[34mdebug:  ^[[39m […n/my-service] my-service started.·


You have all those ugly codes `^[[34m` everywhere in your logs.


STOP worring about this, use StripColorCodes !

    $ npm install -g stripcolorcodes

You can use it with unix pipe:

    $ cat /root/.forever/T9ZW.log | stripcolorcodes
    20120413045946 debug:   […n/my-service] Starting my-service on 0.0.0.0:8080 in dev mode
    20120413045946 debug:   […n/my-service] my-service started.

Or with a file:

    $ stripcolorcodes /root/.forever/T9ZW.log
    20120413045946 debug:   […n/my-service] Starting my-service on 0.0.0.0:8080 in dev mode
    20120413045946 debug:   […n/my-service] my-service started.

Or programmatically:

    var stripColorCodes = require('stripcolorcodes');

    fs.readFile(file, function(err, data){
      if(err) return console.error(err);
      process.stdout.write(stripcolorcodes(data.toString()));
    });

Enjoy !

### LICENCE MIT
