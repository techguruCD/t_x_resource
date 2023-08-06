import axios, { AxiosInstance } from 'axios';
import config from '../config';

class Axios {
    axiosInstance: AxiosInstance;

    constructor(_baseURL: string, _headers: Record<string, string | undefined>) {
        this.axiosInstance = axios.create({ baseURL: _baseURL, headers: _headers })
    }
}

const axiosUtil = {
    coinmarketcapAxios: new Axios(config.coinmarketcapUrl, config.coinmarketcapHeaders).axiosInstance,
    coingeckoAxios: new Axios(config.coingeckoUrl, config.coingeckoHeaders).axiosInstance,
    coinpaprikaAxios: new Axios(config.coinpaprikaUrl, config.coinpaprikaHeaders).axiosInstance,
    cryptowatchAxios: new Axios(config.cryptowatchUrl, config.cryptowatchHeaders).axiosInstance,
    bitqueryAxios: new Axios(config.bitqueryUrl, config.bitqueryHeader).axiosInstance,
    dextoolsAxios: new Axios(config.dexToolsUrl, config.dexToolsHeaders).axiosInstance
}

export default axiosUtil;