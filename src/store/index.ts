import { defineStore } from 'pinia'

export const useWallet = defineStore('wallet', {
    state: () => {
        let wallet: any = ''
        try {
            wallet = localStorage.getItem('wallet')
            wallet = JSON.parse(wallet)
        } catch (e) {
            wallet = ''
        }
        return { wallet }
    },
    getters: {
        double: (state) => state,
    },
    actions: {
        increment(info: any) {
            this.wallet = info
            localStorage.setItem('wallet', JSON.stringify(info))
        },
    },
})