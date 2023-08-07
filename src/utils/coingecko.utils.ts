import { AxiosInstance, isAxiosError } from "axios";
import winston from "winston";

interface GetCoinTickerParams {
    id: string,
    exchange_ids: string | undefined,
    include_exchange_logo: boolean | undefined,
    page: number | undefined,
}

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

    async getCoinInfo(coin_id: string) {
        const url = `/coins/`
        const params = {
            params: {
                id: coin_id
            }
        }

        try {
            const response = await this.axios.get(url, params)

            const null_response = !response.data || response.data.length < 1
            if (null_response) {
                return undefined
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }))
            return undefined
        }
    }

    async getCoinTickers(coin_id: string, exchange_ids?: string[], include_exchange_logo?: boolean, page?: number) {
        const url = `/coins/${coin_id}/tickers`
        const exchange_ids_str = exchange_ids ? exchange_ids.join(',') : undefined

        const params: { params: GetCoinTickerParams } = {
            params: {
                id: coin_id,
                exchange_ids: exchange_ids_str,
                include_exchange_logo,
                page: page
            }
        }

        try {
            const response = await this.axios.get(url, params)

            const null_response = !response.data || response.data.length < 1
            if (null_response) {
                return undefined
            }

            return response.data;
        } catch (error: any) {
            this.logError(error, JSON.stringify({ url, params }))
            return undefined
        }
    }
}

export default CoingeckoApi;
