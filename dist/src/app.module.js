"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const household_module_1 = require("./household/household.module");
const salary_cycles_module_1 = require("./salary-cycles/salary-cycles.module");
const transactions_module_1 = require("./transactions/transactions.module");
const committed_expenses_module_1 = require("./committed-expenses/committed-expenses.module");
const goals_module_1 = require("./goals/goals.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            household_module_1.HouseholdModule,
            salary_cycles_module_1.SalaryCyclesModule,
            transactions_module_1.TransactionsModule,
            committed_expenses_module_1.CommittedExpensesModule,
            goals_module_1.GoalsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map