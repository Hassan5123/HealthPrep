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
exports.Visit = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../users/users.model");
const providers_model_1 = require("../providers/providers.model");
const medications_model_1 = require("../medications/medications.model");
const visit_summaries_model_1 = require("../visit_summaries/visit-summaries.model");
const visit_prep_model_1 = require("../visit_prep/visit-prep.model");
let Visit = class Visit {
    id;
    user_id;
    provider_id;
    visit_date;
    visit_time;
    visit_reason;
    status;
    soft_deleted_at;
    created_at;
    updated_at;
    user;
    provider;
    medications;
    summary;
    prep;
};
exports.Visit = Visit;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Visit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Visit.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Visit.prototype, "provider_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Visit.prototype, "visit_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Visit.prototype, "visit_time", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Visit.prototype, "visit_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Visit.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], Visit.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Visit.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Visit.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_model_1.User, user => user.visits, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_model_1.User)
], Visit.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => providers_model_1.Provider, provider => provider.visits, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", providers_model_1.Provider)
], Visit.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medications_model_1.Medication, medication => medication.prescribed_during_visit),
    __metadata("design:type", Array)
], Visit.prototype, "medications", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => visit_summaries_model_1.VisitSummary, summary => summary.visit),
    __metadata("design:type", visit_summaries_model_1.VisitSummary)
], Visit.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => visit_prep_model_1.VisitPrep, prep => prep.visit),
    __metadata("design:type", visit_prep_model_1.VisitPrep)
], Visit.prototype, "prep", void 0);
exports.Visit = Visit = __decorate([
    (0, typeorm_1.Entity)('visits')
], Visit);
//# sourceMappingURL=visits.model.js.map