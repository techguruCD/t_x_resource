import { AxiosInstance, isAxiosError } from "axios";
import winston from "winston";

class CoingeckoApi {
    private axios: AxiosInstance;
    private logger: winston.Logger;

    constructor(_axiosInstance: AxiosInstance, _logger: winston.Logger) {
        this.axios = _axiosInstance;
        this.logger = _logger;
    }

    private logError(error: any, data: string) {
        let message = error.message ? JSON.stringify({ message: error.message, data }) : data;

        if (isAxiosError(error)) {
            message = `error: ${error.response?.data.error}, data: ${data}`;
        }

        this.logger.error(message);
    }

    async coinsList(page: number) {
        const url = `/coins/markets`;
        const params = {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: '250',
                sparkline: false,
                price_change_percentage: '1h',
                locale: 'en',
                page,
            }
        };

        try {
            const response = await this.axios.get(url, params);

            if (!response.data) {
                return undefined;
            }

            if (!Array.isArray(response.data)) {
                return undefined;
            }

            if (response.data.length < 1) {
                return undefined;
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }));
            return undefined;
        }
    }

    async coinInfo(coin_id: string) {
        const url = `/coins/${coin_id}`
        const params = {
            params: {
                localization: 'en',
                tickers: false,
                market_data: false,
                community_data: false,
                developer_data: false,
                sparkline: false
            }
        }
    
        try {
            const response = await this.axios.get(url);

            if (!response.data) {
                return undefined;
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }));
            return undefined;
        }
    }

    async coinTickers(coin_id: string, page = 1) {
        const url = `/coins/${coin_id}/tickers`

        const params = { params: { include_exchange_logo: true, page } };

        try {
            const response = await this.axios.get(url, params)

            if (!response.data) {
                return undefined;
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }))
            return undefined
        }
    }

    async coinChart(coin_id: string) {
        const url = `/coins/${coin_id}/market_chart`;

        const params = { params: {vs_currency: 'usd', days: 30, interval: 'daily'} };

        try {
            const response = await this.axios.get(url, params)

            if (!response.data) {
                return undefined;
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }))
            return undefined
        }
    }
}

export default CoingeckoApi;
