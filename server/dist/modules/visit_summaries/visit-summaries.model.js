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
exports.VisitSummary = void 0;
const typeorm_1 = require("typeorm");
const visits_model_1 = require("../visits/visits.model");
let VisitSummary = class VisitSummary {
    id;
    visit_id;
    new_diagnosis;
    follow_up_instructions;
    doctor_recommendations;
    patient_concerns_addressed;
    patient_concerns_not_addressed;
    visit_summary_notes;
    soft_deleted_at;
    created_at;
    updated_at;
    visit;
};
exports.VisitSummary = VisitSummary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VisitSummary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], VisitSummary.prototype, "visit_id", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitSummary.prototype, "new_diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitSummary.prototype, "follow_up_instructions", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitSummary.prototype, "doctor_recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitSummary.prototype, "patient_concerns_addressed", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitSummary.prototype, "patient_concerns_not_addressed", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VisitSummary.prototype, "visit_summary_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], VisitSummary.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VisitSummary.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VisitSummary.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => visits_model_1.Visit, visit => visit.summary, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'visit_id' }),
    __metadata("design:type", visits_model_1.Visit)
], VisitSummary.prototype, "visit", void 0);
exports.VisitSummary = VisitSummary = __decorate([
    (0, typeorm_1.Entity)('visit_summaries')
], VisitSummary);
//# sourceMappingURL=visit-summaries.model.js.map