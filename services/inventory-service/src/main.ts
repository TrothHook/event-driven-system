import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	// listen on a service-specific port so it stays alive
	const port = process.env.PORT ? Number(process.env.PORT) : 3002;
	await app.listen(port);
	console.log(`Inventory Service running on http://localhost:${port}`);
}

bootstrap();
