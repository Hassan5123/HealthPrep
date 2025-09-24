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
exports.Medication = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../users/users.model");
const providers_model_1 = require("../providers/providers.model");
const visits_model_1 = require("../visits/visits.model");
let Medication = class Medication {
    id;
    user_id;
    prescribing_provider_id;
    prescribed_during_visit_id;
    medication_name;
    dosage;
    frequency;
    conditions_or_symptoms;
    prescribed_date;
    instructions;
    status;
    soft_deleted_at;
    created_at;
    updated_at;
    user;
    prescribing_provider;
    prescribed_during_visit;
};
exports.Medication = Medication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Medication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", Number)
], Medication.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Medication.prototype, "prescribing_provider_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Medication.prototype, "prescribed_during_visit_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Medication.prototype, "medication_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Medication.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Medication.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Medication.prototype, "conditions_or_symptoms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Medication.prototype, "prescribed_date", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Medication.prototype, "instructions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['taking', 'discontinued'],
        default: 'taking'
    }),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", String)
], Medication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", Object)
], Medication.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Medication.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Medication.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_model_1.User, user => user.medications, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_model_1.User)
], Medication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => providers_model_1.Provider, provider => provider.medications, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'prescribing_provider_id' }),
    __metadata("design:type", providers_model_1.Provider)
], Medication.prototype, "prescribing_provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visits_model_1.Visit, visit => visit.medications, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'prescribed_during_visit_id' }),
    __metadata("design:type", visits_model_1.Visit)
], Medication.prototype, "prescribed_during_visit", void 0);
exports.Medication = Medication = __decorate([
    (0, typeorm_1.Entity)('medications')
], Medication);
//# sourceMappingURL=medications.model.js.map