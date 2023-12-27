import { unZip } from '../utils/index'
import * as path from "path";
import { _writeFile, portAvailable } from '../../utils/indes'
import logger from '../log'
import { shell } from 'electron'

export const openUrl = (event: any, url: string) => {
    shell.openExternal(url)
}


export const updateElectron = (event: any, win: any, url: string, name: string) => {
    const webContents = event.sender
    logger.info('upload url: ' + url)
    webContents.downloadURL(url);
    webContents.session.once('will-download', (event: any, item: any, webContents: any) => {
        const filePath = path.join(process.cwd(), '/download', `${name}`);
        item.setSavePath(filePath);
        item.on('updated', (event: any, state: any) => {
            if (state === 'interrupted') {
                logger.info('Download interrupted, can continue')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    logger.info('Download paused')
                } else {
                    logger.info(`The received bytes of the current downloaded project${item.getReceivedBytes()}`)
                    logger.info(`Download completion percentage:${item.getReceivedBytes() / item.getTotalBytes() * 100}`)
                }
            }
        });


        item.once('done', async (event: any, state: any) => {
            if (state === 'completed') {
                logger.info('over')
                const data = await unZip(name)
                webContents && webContents.send('uploadEnd', { type: 'stop_err', status: 'stop_er', msg: JSON.stringify('Err') })
            }
        })
    })
}


