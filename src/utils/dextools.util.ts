import { AxiosInstance, isAxiosError } from "axios";
import winston from "winston";

class DextoolsApi {
    private axios: AxiosInstance;
    private logger: winston.Logger;

    constructor(_axiosInstance: AxiosInstance, _logger: winston.Logger) {
        this.axios = _axiosInstance;
        this.logger = _logger;
    }

    private logError(error: any) {
        let message = "";

        if (isAxiosError(error)) {
            message = `Something went wrong`;

            if (error.response?.data?.errorMessage) {
                const errorData = error.response?.data;
                message = `errorMessage: ${errorData?.errorMessage}. errorStatusCode: ${errorData?.statusCode}.`
            }

            message += `Status: ${error.response?.status}`
        }

        this.logger.error(message);
    }

    async fetchToken(chain: string, address: string, page = 0, pageSize = 50) {
        const url = `/token`;

        try {
            const response = await this.axios.get(url, {
                params: { chain, address, page, pageSize }
            });

            return response.data.data;
        } catch (error) {
            this.logError(error);
            return undefined;
        }
    }
}

export default DextoolsApi;