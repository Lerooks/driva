-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "isValid" BOOLEAN,
    "companyCnpj" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phones" (
    "id" TEXT NOT NULL,
    "number" VARCHAR(20) NOT NULL,
    "isValid" BOOLEAN,
    "companyCnpj" TEXT NOT NULL,

    CONSTRAINT "phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "cnpj" VARCHAR(14) NOT NULL,
    "corporateName" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "segment" VARCHAR(100) NOT NULL,
    "registrationStatus" "RegistrationStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("cnpj")
);

-- CreateTable
CREATE TABLE "enrichments" (
    "id" TEXT NOT NULL,
    "jobId" UUID NOT NULL,
    "status" "JobStatus" NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrichments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrichment_companies" (
    "id" TEXT NOT NULL,
    "enrichmentId" TEXT NOT NULL,
    "companyCnpj" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrichment_companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_address_companyCnpj_key" ON "emails"("address", "companyCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "phones_number_companyCnpj_key" ON "phones"("number", "companyCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "enrichment_companies_enrichmentId_companyCnpj_key" ON "enrichment_companies"("enrichmentId", "companyCnpj");

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_companyCnpj_fkey" FOREIGN KEY ("companyCnpj") REFERENCES "companies"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phones" ADD CONSTRAINT "phones_companyCnpj_fkey" FOREIGN KEY ("companyCnpj") REFERENCES "companies"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrichment_companies" ADD CONSTRAINT "enrichment_companies_enrichmentId_fkey" FOREIGN KEY ("enrichmentId") REFERENCES "enrichments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrichment_companies" ADD CONSTRAINT "enrichment_companies_companyCnpj_fkey" FOREIGN KEY ("companyCnpj") REFERENCES "companies"("cnpj") ON DELETE RESTRICT ON UPDATE CASCADE;
