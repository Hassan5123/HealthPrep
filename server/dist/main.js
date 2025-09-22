"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Main');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 5001;
    app.enableShutdownHooks();
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
        process.on(signal, async () => {
            logger.log(`Received ${signal}, gracefully shutting down...`);
            try {
                await app.close();
                logger.log('Server closed successfully');
                process.exit(0);
            }
            catch (error) {
                logger.error(`Error during shutdown: ${error}`);
                process.exit(1);
            }
        });
    });
    await app.listen(port);
    logger.log(`Server is running on Port ${port}`);
    logger.log('MySQL connection successful');
}
bootstrap().catch(error => {
    const logger = new common_1.Logger('Bootstrap');
    logger.error(`Server failed to start: ${error}`);
    process.exit(1);
});
//# sourceMappingURL=main.js.map