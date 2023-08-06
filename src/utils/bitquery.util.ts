import { AxiosInstance, isAxiosError } from "axios";
import moment from 'moment';
import winston from "winston";
import bqQueries from "../biquery-scripts/bq.queries";
import delayExecution from "./executionDelay.utils";

class BitqueryApi {
    private axios: AxiosInstance;
    private logger: winston.Logger;

    constructor(_axiosInstance: AxiosInstance, _logger: winston.Logger) {
        this.axios = _axiosInstance;
        this.logger = _logger;
    }

    private logError(error: any) {
        let message = "";
        if (isAxiosError(error)) {

            message = `Something went wrong`

            if (error.response?.data?.errors && Array.isArray(error.response?.data?.errors) && error.response?.data?.errors.length > 1) {
                const errorMessage = error.response?.data?.errors[0].message;
                message = `message: ${errorMessage}`
            }

            if (error.response?.status) {
                message = `status: ${error.response?.status}, statusText: ${error.response.statusText}`
            }

            this.logger.error(message);
        } else {
            this.logger.error(error.message ? JSON.stringify({ message: error.message }) : "Something went wrong");
        }
    }

    async listCoins(network: string, limit = 500, offset = 0, from?: string, till?: string, networkQueryString = "ethereum") {
        try {
            if (!from) {
                from = moment.utc().subtract(1, "days").format("YYYY-MM-DD");
            }

            if (!till) {
                till = moment.utc().format("YYYY-MM-DD");
            }

            const query = bqQueries.fetchTokens(network, limit, offset, from, till, networkQueryString);
            const data = await this.axios.post('', { query, variables: {} });
            const transfers = data?.data?.data?.[networkQueryString]?.transfers;

            if (transfers && Array.isArray(transfers) && transfers.length > 0) {
                return transfers;
            }

            return [];
        } catch (error: any) {
            this.logError(error)
            return [];
        }
    }

    async listPairs(network: string, baseCurrency: string[], limit = 500, offset = 0, from?: string, till?: string, networkQueryString = "ethereum") {
        try {
            if (!from) {
                from = moment.utc().subtract(1, "days").format("YYYY-MM-DD");
            }

            if (!till) {
                till = moment.utc().format("YYYY-MM-DD");
            }

            await delayExecution(1000);
            const query = bqQueries.fetchPairs(network, baseCurrency, limit, offset, from, till, networkQueryString);
            const response = await this.axios.post('', { query, variables: {} });
            this.logger.info(`listPairs api call status ${response.status}`);
            const dexTrades = response?.data?.data?.[networkQueryString]?.dexTrades;

            if (dexTrades && Array.isArray(dexTrades) && dexTrades.length > 0) {
                return dexTrades;
            }

            return [];
        } catch (error) {
            if (isAxiosError(error)) {
                this.logError(`listPairs api call status ${error.response?.status}`);
                return [];
            }
            this.logError(error)
            return [];
        }
    }

    async listPairs2(network: string, limit = 500, offset = 0, from?: string, till?: string, networkQueryString = "ethereum") {
        try {
            if (!from) {
                from = moment.utc().subtract(1, "days").format("YYYY-MM-DD");
            }

            if (!till) {
                till = moment.utc().format("YYYY-MM-DD");
            }

            await delayExecution(1000);
            const query = bqQueries.fetchPairs2(network, limit, offset, from, till, networkQueryString);
            const response = await this.axios.post('', { query, variables: {} });
            this.logger.info(`listPairs2 api call status ${response.status}`);
            const dexTrades = response?.data?.data?.[networkQueryString]?.dexTrades;

            if (dexTrades && Array.isArray(dexTrades) && dexTrades.length > 0) {
                return dexTrades;
            }

            return [];
        } catch (error) {
            if (isAxiosError(error)) {
                this.logError(`listPairs2 api call status ${error.response?.status}`);
                return [];
            }
            this.logError(error)
            return [];
        }
    }
}

export default BitqueryApi;