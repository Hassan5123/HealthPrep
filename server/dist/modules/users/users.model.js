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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const symptoms_model_1 = require("../symptoms/symptoms.model");
const visits_model_1 = require("../visits/visits.model");
const medications_model_1 = require("../medications/medications.model");
let User = class User {
    id;
    email;
    password_hash;
    first_name;
    last_name;
    date_of_birth;
    phone;
    existing_conditions;
    soft_deleted_at;
    created_at;
    updated_at;
    symptoms;
    visits;
    medications;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)('idx_name', { synchronize: false }),
    __metadata("design:type", String)
], User.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)('idx_name', { synchronize: false }),
    __metadata("design:type", String)
], User.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], User.prototype, "date_of_birth", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], User.prototype, "existing_conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], User.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => symptoms_model_1.Symptom, symptom => symptom.user),
    __metadata("design:type", Array)
], User.prototype, "symptoms", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => visits_model_1.Visit, visit => visit.user),
    __metadata("design:type", Array)
], User.prototype, "visits", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medications_model_1.Medication, medication => medication.user),
    __metadata("design:type", Array)
], User.prototype, "medications", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=users.model.js.map