import { cpuTemperature, Systeminformation } from "systeminformation";
import { logger } from "../utils/LoggingHelper.js";

export async function checkTemp(): Promise<Systeminformation.CpuTemperatureData> {
    try {
        return await cpuTemperature();
    } catch (error) {
        logger.error(error);
    }
}
