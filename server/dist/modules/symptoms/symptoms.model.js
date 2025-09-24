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
exports.Symptom = void 0;
const typeorm_1 = require("typeorm");
const users_model_1 = require("../users/users.model");
let Symptom = class Symptom {
    id;
    user_id;
    symptom_name;
    severity;
    onset_date;
    description;
    end_date;
    location_on_body;
    triggers;
    related_condition;
    related_medications;
    medications_taken;
    status;
    soft_deleted_at;
    created_at;
    updated_at;
    user;
};
exports.Symptom = Symptom;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Symptom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", Number)
], Symptom.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Symptom.prototype, "symptom_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Symptom.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Symptom.prototype, "onset_date", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Symptom.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "location_on_body", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "triggers", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "related_condition", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "related_medications", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Symptom.prototype, "medications_taken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'resolved', 'monitoring'],
        default: 'active'
    }),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", String)
], Symptom.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Index)('idx_user_status', { synchronize: false }),
    __metadata("design:type", Object)
], Symptom.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Symptom.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Symptom.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_model_1.User, user => user.symptoms, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", users_model_1.User)
], Symptom.prototype, "user", void 0);
exports.Symptom = Symptom = __decorate([
    (0, typeorm_1.Entity)('symptoms_or_side_effects'),
    (0, typeorm_1.Check)(`severity >= 1 AND severity <= 10`)
], Symptom);
//# sourceMappingURL=symptoms.model.js.map