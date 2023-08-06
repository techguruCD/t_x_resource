import { AxiosInstance, isAxiosError } from "axios";
import winston from "winston";

class CoinmarketcapApi {
    private axios: AxiosInstance;
    private logger: winston.Logger;

    constructor(_axiosInstance: AxiosInstance, _logger: winston.Logger) {
        this.axios = _axiosInstance;
        this.logger = _logger;
    }

    private logError(error: any, data: string) {
        let message = error.message ? JSON.stringify({ message: error.message, data }) : data;

        if (isAxiosError(error)) {

            message = `Something went wrong. data: ${data}`

            if (error.response?.data?.status) {
                const status = error.response?.data?.status
                message = `timestamp: ${status.timestamp}, error_code: ${status.error_code}, error_message: ${status.error_message}, elapsed: ${status.elapsed}, credit_count: ${status.credit_count}, data: ${data}}`
            }

            if (error.response?.status) {
                message = `status: ${error.response?.status}, statusText: ${error.response.statusText}, data: ${data}`
            }
        }

        this.logger.error(message);
    }

    // Cache / Update frequency: Every 60 seconds.
    // 1 call credit per 200 cryptocurrencies returned (rounded up) and 1 call credit per convert option beyond the first.
    async listingsLatest(start?: number, limit?: number, sort?: string, sort_dir?: string) {
        const params: Record<string, any> = {};

        if (!start) { start = 1 }
        if (start < 1) { start = 1 };
        params["start"] = start;

        if (!limit) { limit = 5000 };
        if (limit < 1) { limit = 1 }
        if (limit > 5000) { limit = 5000 }
        params["limit"] = limit;

        if (!sort) { sort = "market_cap" }
        params["sort"] = sort;

        if (!sort_dir) { sort_dir = "desc" };
        params["sort_dir"] = sort_dir;

        const url = `/v1/cryptocurrency/listings/latest`

        try {
            const response = await this.axios.get(url, { params });
            const data = response.data.data;
            
            if (!data || (Array.isArray(data) && data.length < 1)) {
                this.logger.info('no more data in listingsLatest');
                return undefined;
            }
            return data;
        } catch (error) {
            this.logError(error, JSON.stringify({ url, params }));
            return undefined;
        }

    }

    // Cache / Update frequency: Static data is updated only as needed, every 30 seconds.
    // Plan credit use: 1 call credit per 100 cryptocurrencies returned(rounded up).
    async metadata(id?: string, slug?: string, symbol?: string, address?: string, skip_invalid?: boolean, aux?: string) {
        const params: Record<string, any> = {}

        if (id) { params["id"] = id };

        if (slug) { params["slug"] = slug };

        if (symbol) { params["symbol"] = symbol };

        if (address) { params["address"] = address };

        if (skip_invalid) { params["skip_invalid"] = skip_invalid };

        if (aux) { params["aux"] = aux };

        const url = '/v2/cryptocurrency/info';

        try {
            const response = await this.axios.get(url, { params });
            return response.data.data;
        } catch (error) {
            this.logError(error, JSON.stringify({ url, params }));
            return undefined;
        }
    }
}

export default CoinmarketcapApi;