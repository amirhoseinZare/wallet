import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor() {}

  /**
   * Redirects from the root URL to the Swagger documentation.
   *
   * @returns A redirect response to the Swagger documentation URL.
   */
  @Get()
  @Redirect('/api-docs', 302)
  getHello(): void {
    // No need to include any logic here, the @Redirect decorator handles it.
  }
}
