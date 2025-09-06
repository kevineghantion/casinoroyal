@echo off
echo Opening firewall for mobile testing...
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=8080
echo Done! Now try accessing http://192.168.0.112:8080 on your phone
pause