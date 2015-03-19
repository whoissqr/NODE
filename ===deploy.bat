ECHO OFF
pushd "%~dp0"

ECHO ---- Update repo to HEAD revision ----
svn up

ECHO.

ECHO ---- Stop remote web service      ----
C:\workspace\repo_web02_MPRS\Tools\PSTools\PsExec \\xap-opsweb01 net stop MPRS.Web

ECHO.

ECHO ---- Start remote web service     ----
C:\workspace\repo_web02_MPRS\Tools\PSTools\PsExec \\xap-opsweb01 net start MPRS.Web

ECHO.
ECHO.
ECHO ********************
ECHO **** Success *******
ECHO ********************

ECHO.
ECHO.

pause
