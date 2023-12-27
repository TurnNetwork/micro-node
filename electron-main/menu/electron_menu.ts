import { Menu } from 'electron';


export const setMenu = () => {
    let template:any =[]
    if (process.platform === 'darwin') {
        template = [{
        label: 'My app',
        submenu: [
          { label: 'exit', accelerator: 'Command+Q',role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          { label: 'cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { label: 'selectAll', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
        ]
      }]
    }
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}