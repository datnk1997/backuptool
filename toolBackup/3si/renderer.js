const { getGlobal,dialog } = require('electron').remote;
const { app } = require('electron')

const fs = require('fs');
var backupPath;
var restorePath;

//position save file backup
document.getElementById('backup-path').addEventListener('click', () => {
    var p = dialog.showSaveDialog({});
    p.then(path => {
        backupPath = path.filePath + ".backup"
        console.log(backupPath)
    });
}, false);
// get URL file restore
document.getElementById('restore-file').addEventListener('click', () => {
    var p = dialog.showOpenDialog({});
    p.then(path => {
        restorePath = path.filePaths[0]
        console.log(restorePath)
    });
}, false);

//handle file backup
document.getElementById('backup-file').addEventListener('click', () => {
    var dbHost = document.getElementById('host').value
    var dbPort = document.getElementById('port').value
    var dbUser = document.getElementById('user').value
    var dbName = document.getElementById('dbname').value
    var dbPassword = document.getElementById('dbpassword').value
    // validate
    if(!dbHost || !dbPort || !dbUser || !dbName || !dbPassword){
        dialog.showErrorBox('','Nhập đủ TT !');
    } else {
        //export file batch
        var savePath = backupPath.substring(0, backupPath.length - 7) +".bat"
        console.log(savePath)
        var data = [
        "@ECHO OFF "+"\r\n"+
        "SET PGPASSWORD="+ dbPassword + "\r\n" + "pg_dump -h " + dbHost + " -p "+ dbPort + " -U " + dbUser + " -d " + dbName +" --format=custom -f " + backupPath + "\r\n" +
        "if %ERRORLEVEL% GEQ 1 echo backupError" + "\r\n" +
        "if %ERRORLEVEL% EQU 0 echo backupSuccess"
        ]
        fs.writeFile(savePath, data, (err) => {
            if (err) {
                console.log(err)
                return
            }
            //run file batch
            var child_process = require('child_process');
            child_process.exec(savePath, function(error, stdout, stderr) {
                
                if (stdout.trim() === "backupError") {
                    dialog.showErrorBox('','Check info connect');
                }
                else if (stdout.trim() === "backupSuccess"  ) {
                    dialog.showMessageBox({message: 'Backup database success'});
                }
                else {
                    console.log("loi Backup")
                }
            });
        })
    }
}, false);

document.getElementById('restore-btn').addEventListener('click', () => {
    var dbName = document.getElementById('rs-dbname').value
    var dbHost = document.getElementById('rs-host').value
    var dbUser = document.getElementById('rs-dbuser').value
    var dbPassword = document.getElementById('rs-dbpassword').value
    if(!dbHost || !dbUser || !dbName || !dbPassword){
        dialog.showErrorBox('','Nhập đủ TT !');
    } else {
        
        var rsBat = restorePath.substring(0, restorePath.length - 7) +"_restore.bat"
        console.log(rsBat)
        var data = [
        "@ECHO OFF "+"\r\n"+
        "SET PGPASSWORD="+ dbPassword + "\r\n" + "pg_restore -h " + dbHost + " -U " + dbUser + " -d " + dbName +" --role postgres -c " + restorePath + "\r\n" +
        "if %ERRORLEVEL% GEQ 1 echo restoreError" + "\r\n" +
        "if %ERRORLEVEL% EQU 0 echo restoreSuccess"
        ]
        fs.writeFile(rsBat, data, (err) => {
            if (err) {
                console.log(err)
                return
            }
            //run file batch
            var child_process = require('child_process');
            child_process.exec(rsBat, function(error, stdout, stderr) {
                console.log("exit status: ", stdout)
                if (stdout.trim() === "restoreError") {
                    dialog.showErrorBox('','Hãy chắc chắn db tồn tại hoặc kiểm tra lại kết nối');
                }
                else if (stdout === "" || stdout.trim() === "restoreSuccess"  ) {
                    dialog.showMessageBox({message: 'Restore database success'});
                }
                else {
                    console.log("loi Restore")
                }
            });
        })
    }
}, false);

document.getElementById('restore-tab').addEventListener('click', () => {
    document.getElementById("backup-tab").classList.remove("active")
    document.getElementById("restore-tab").classList.add("active")
    document.getElementById("backup").classList.remove("show" && "active")
    document.getElementById("restore").classList.add("show")
    document.getElementById("restore").classList.add("active")
    
})
document.getElementById('backup-tab').addEventListener('click', () => {
    document.getElementById("backup-tab").classList.add("active")
    document.getElementById("restore-tab").classList.remove("active")
    document.getElementById("backup").classList.add("show" && "active")
    document.getElementById("restore").classList.remove("show")
    document.getElementById("restore").classList.remove("active")
})
