import { AxiosInstance, isAxiosError } from "axios";
import winston from "winston";

class AegisApi {
  private axios: AxiosInstance;
  private logger: winston.Logger;

  constructor(_axiosInstance: AxiosInstance, _logger: winston.Logger) {
    this.axios = _axiosInstance;
    this.logger = _logger;
  }

  private logError(error: any) {
    let message = "";
    
    if (isAxiosError(error)) {
      message = error.response?.data?.errorMsg ?? "Something Went Wrong"
      message += error.response?.status ?? error.status;
    } else {
      message = error.message ?? "Something Went Wrong"
      message += error.response.status;
    }

    this.logger.error(message);
  }

  async getSupportedChains() {
    try {
      const response = await this.axios.get("/api/v1/chainList");
      this.logger.info(`getSupportedChain api call status ${response.status}`);
      if (response.data.errorCode === 0) {
        return response.data.result as Array<any>; // TODO: strict typing
      }
      return [];
    } catch (error) {
      this.logError(error)
      return [];
    }
  }

  async getTokenQuickCheckData(chainid: number, address: string) {
    try {
      const response = await this.axios.get("/api/User/TokenSecurity", { params: { chainid, address } });
      this.logger.info(`getTokenQuickCheckData api call status ${response.status}`);
      if (response.data.errorCode === 0) {
        return response.data.result
      }
      return undefined;
    } catch (error) {
      this.logError(error)
      return undefined;
    }
  }
}

export default AegisApi;