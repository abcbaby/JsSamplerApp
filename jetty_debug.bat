set JAVA_HOME=C:\opt\jdk1.8.0_40-b26
set path=C:\opt\jdk1.8.0_40-b26\bin;C:\opt\Netbeans 8.0.2\java\maven\bin;%path%
set PORT=%1

if "" == "%PORT%" set PORT=7555

set JAVA_MEM=-Xms256m -Xmx512m
set TIMEZONE=-Duser.timezone=GMT+00:00
@rem set TEMP_DIR=-Djava.io.tmpdir=/opt/temp
set MAVEN_OPTS=%JAVA_MEM% %TIMEZONE% %TEMP_DIR% -Djava.net.preferIPv4Stack=true -Xdebug -Xnoagent -Dmaven.test.skip=true -Dhttp.proxyHost=firewall -Dhttp.proxyPort=80 -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=%PORT%,server=y,suspend=n
@echo First argument must be the DEBUG port which is currently: %PORT%
@echo Use -o argument to run off-line: jetty_debug.bat %PORT% -o 
@echo Use clean to do a clean build: jetty_debug.bat %PORT% clean
@call mvn %1 %2 jetty:run
