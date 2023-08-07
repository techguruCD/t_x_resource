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

        const response = await this.axios.get(url, params);
        try {
            if (!response.data) {
                return undefined;
            }

            if (Array.isArray(response.data) && response.data.length < 1) {
                return undefined;
            }

            return response.data;
        } catch (error) {
            this.logError(error, JSON.stringify({url, params}));
            return undefined;
        }

    }
}

export default CoingeckoApi;
