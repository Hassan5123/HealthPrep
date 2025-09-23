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
exports.VisitPrep = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../users/users.model");
const visits_model_1 = require("../visits/visits.model");
let VisitPrep = class VisitPrep {
    id;
    user_id;
    visit_id;
    questions_for_doctor;
    symptoms_to_discuss;
    medication_issues;
    other_notes;
    status;
    soft_deleted_at;
    created_at;
    updated_at;
    user;
    visit;
};
exports.VisitPrep = VisitPrep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VisitPrep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], VisitPrep.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], VisitPrep.prototype, "visit_id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VisitPrep.prototype, "questions_for_doctor", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitPrep.prototype, "symptoms_to_discuss", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitPrep.prototype, "medication_issues", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], VisitPrep.prototype, "other_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['draft', 'completed'],
        default: 'draft'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VisitPrep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], VisitPrep.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VisitPrep.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VisitPrep.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_model_1.User, user => user.visitPreps, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_model_1.User)
], VisitPrep.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => visits_model_1.Visit, visit => visit.prep, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'visit_id' }),
    __metadata("design:type", visits_model_1.Visit)
], VisitPrep.prototype, "visit", void 0);
exports.VisitPrep = VisitPrep = __decorate([
    (0, typeorm_1.Entity)('visit_prep')
], VisitPrep);
//# sourceMappingURL=visit-prep.model.js.map