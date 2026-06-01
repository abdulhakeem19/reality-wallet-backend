"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryCyclesService = exports.UpdateCycleDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
class UpdateCycleDto {
    income;
    salaryDay;
}
exports.UpdateCycleDto = UpdateCycleDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCycleDto.prototype, "income", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(28),
    __metadata("design:type", Number)
], UpdateCycleDto.prototype, "salaryDay", void 0);
let SalaryCyclesService = class SalaryCyclesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureCurrent(userId) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const existing = await this.prisma.salaryCycle.findUnique({
            where: { userId_month_year: { userId, month, year } },
        });
        if (existing)
            return existing;
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const prev = await this.prisma.salaryCycle.findUnique({
            where: { userId_month_year: { userId, month: lastMonth, year: lastYear } },
        });
        const salaryDay = prev?.salaryDay ?? 1;
        const newCycle = await this.prisma.salaryCycle.create({
            data: {
                userId,
                month,
                year,
                income: prev?.income ?? 0,
                salaryDay,
                startDate: new Date(year, month - 1, salaryDay),
            },
        });
        return newCycle;
    }
    async update(userId, cycleId, dto) {
        return this.prisma.salaryCycle.update({
            where: { id: cycleId, userId },
            data: dto,
        });
    }
};
exports.SalaryCyclesService = SalaryCyclesService;
exports.SalaryCyclesService = SalaryCyclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalaryCyclesService);
//# sourceMappingURL=salary-cycles.service.js.map