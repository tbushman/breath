var electron = require('electron');
var app = electron.app;
var os = require('os');
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;
var logger = require('winston');
var fs = require('fs');
var async = require('async');
var autoUpdater = require('electron-updater').autoUpdater;
var dialog = electron.dialog;
var Menu = electron.Menu;
var counter = 0;


logger.level = 'debug';
global.logger = logger;

// Keep reference of main window because of GC
var mainWindow = null;

autoUpdater.addListener('update-available', () => {
	console.log('update available')
})
autoUpdater.addListener('checking-for-update', () => {
	console.log('checking-for-update')
})
autoUpdater.addListener('update-not-available', () => {
	console.log('update-not-available')
})
autoUpdater.addListener('update-downloaded', (e) => {
	console.log(e)
	dialog.showMessageBox({
		message: 'An update is available. Do you want to install it?',
		buttons: ['YES', 'NO']					
	}, function(index){
		if(index === 0) {
			sd_type = 'autoupdate';
			autoUpdater.quitAndInstall();
			return true
		} else {
			e.preventDefault()
		}
	})
		
})
autoUpdater.setFeedURL({
		provider: 'generic',
		url: 'https://s3-us-west-2.amazonaws.com/traceybushman/b'
});
autoUpdater.checkForUpdates();


// Quit when all windows are closed
app.on('window-all-closed', function() {
	
	app.quit();
});

app.on('browser-window-created', function(){
	
})

// When application is ready, create application window
app.on('ready', function() {
	logger.debug("Starting application");
	app.setAppUserModelId('com.electron.breath_b');
		// Create main window
		// Other options available at:
		// http://electron.atom.io/docs/latest/api/browser-window/#new-browserwindow-options
		mainWindow = new BrowserWindow({
				name: "breath",
				width: 70,
				height: 780
		});
	var template = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Home',
				click () { mainWindow.webContents.send('home', 'home')}
			},
			{ type: 'separator' },
			{
				label: 'Check for updates',
				click () { autoUpdater.checkForUpdates() }
			}
		]
	},
	{
		label: 'Edit',
			submenu: [
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'delete' },
			{ role: 'selectall' }
			]
	},
	{
		label: 'View',
			submenu: [
			{ role: 'reload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
			]
	},
	{
		role: 'window',
			submenu: [
			{ role: 'minimize' },
			{ role: 'close' }
			]
	},
	{
		role: 'help',
			submenu: [
			{
						label: 'Learn More',
						click () { require('electron').shell.openExternal('http://electron.atom.io') }
			}
			]
	}]
	
	mainWindow.focus();
		// Target HTML file which will be opened in window
		mainWindow.loadURL('file://' + __dirname + '/index.html');
		
	var menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu);
	
		
		// Cleanup when window is closed
		mainWindow.on('closed', function() {
		mainWindow = null;
		});
 
});