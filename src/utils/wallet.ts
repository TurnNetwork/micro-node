
export const WalletGet = () => {
    let wallet = (window as any).localStorage.getItem('wallet') || ''
    try {
        wallet = JSON.parse(wallet)
        return wallet
    } catch (e) {
        return ''
    }
}


export const WalletSet = (wallet: any) => {
    try {
        let obj = JSON.stringify(wallet);

        (window as any).localStorage.setItem('wallet', obj)
    } catch (e) {

    }
}

