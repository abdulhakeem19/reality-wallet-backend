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
exports.CommittedExpensesService = exports.CreateCommittedExpenseDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
class CreateCommittedExpenseDto {
    name;
    amount;
    category;
    isRecurring;
    frequency;
}
exports.CreateCommittedExpenseDto = CreateCommittedExpenseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommittedExpenseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCommittedExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommittedExpenseDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCommittedExpenseDto.prototype, "isRecurring", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommittedExpenseDto.prototype, "frequency", void 0);
let CommittedExpensesService = class CommittedExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requireHousehold(userId) {
        const member = await this.prisma.householdMember.findUnique({ where: { userId } });
        if (!member)
            throw new common_1.ForbiddenException('Join or create a household first');
        return member.householdId;
    }
    async findAll(userId) {
        const householdId = await this.requireHousehold(userId);
        return this.prisma.committedExpense.findMany({ where: { householdId }, orderBy: { name: 'asc' } });
    }
    async create(userId, dto) {
        const householdId = await this.requireHousehold(userId);
        return this.prisma.committedExpense.create({
            data: { householdId, ...dto, isRecurring: dto.isRecurring ?? true, frequency: dto.frequency ?? 'monthly' },
        });
    }
    async update(userId, id, dto) {
        const householdId = await this.requireHousehold(userId);
        const expense = await this.prisma.committedExpense.findUnique({ where: { id } });
        if (!expense || expense.householdId !== householdId)
            throw new common_1.NotFoundException();
        return this.prisma.committedExpense.update({ where: { id }, data: dto });
    }
    async remove(userId, id) {
        const householdId = await this.requireHousehold(userId);
        const expense = await this.prisma.committedExpense.findUnique({ where: { id } });
        if (!expense || expense.householdId !== householdId)
            throw new common_1.NotFoundException();
        await this.prisma.committedExpense.delete({ where: { id } });
    }
};
exports.CommittedExpensesService = CommittedExpensesService;
exports.CommittedExpensesService = CommittedExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommittedExpensesService);
//# sourceMappingURL=committed-expenses.service.js.map