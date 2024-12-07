 const remote=require('remote')
 const Menu = remote.require('menu')
 const MenuItem = remote.require('menu-item')

 let rightClickPosition = null

 const menu = new Menu();
 const now = new Date();
 const menuItem = MenuItem({
    label: 'Inspect Element',
    click: () => {
        remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
    }
 })
menu.append(menuItem)

window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    rightClickPosition = {x: e.x, y: e.y}
    menu.popup(remote.getCurrentWindow())
}, false)