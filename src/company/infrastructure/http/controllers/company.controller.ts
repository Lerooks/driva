import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateCompanyCommand } from '~/company/application/commands/create-company.command';
import { EnrichCompaniesCommand } from '~/company/application/commands/enrich-companies-command';
import { CreateCompany } from '~/company/application/usecases/create-company.usecase';
import { EnrichCompanies } from '~/company/application/usecases/enrich-companies.usecase';
import { GetCompany } from '~/company/application/usecases/get-company.usecase';

@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompany.Usecase,
    private readonly getCompanyUseCase: GetCompany.Usecase,
    private readonly enrichCompaniesUseCase: EnrichCompanies.Usecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: unknown) {
    try {
      const command = CreateCompanyCommand.fromObject(data);
      await this.createCompanyUseCase.execute(command);
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  @Get(':cnpj')
  async get(@Param('cnpj') cnpj: string) {
    try {
      return await this.getCompanyUseCase.execute(cnpj);
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  @Post('/enrich')
  @HttpCode(HttpStatus.ACCEPTED)
  async enrich(@Body() body: unknown) {
    try {
      const command = EnrichCompaniesCommand.fromObject(body);
      return await this.enrichCompaniesUseCase.execute(command);
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }
}
