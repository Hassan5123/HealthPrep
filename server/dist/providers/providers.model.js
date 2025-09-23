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
exports.Provider = void 0;
const typeorm_1 = require("typeorm");
const visits_model_1 = require("../visits/visits.model");
const medications_model_1 = require("../medications/medications.model");
let Provider = class Provider {
    id;
    provider_name;
    provider_type;
    specialty;
    phone;
    email;
    office_address;
    notes;
    soft_deleted_at;
    created_at;
    updated_at;
    visits;
    medications;
};
exports.Provider = Provider;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Provider.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Provider.prototype, "provider_name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['personal_doctor', 'walk_in_clinic', 'emergency_room', 'urgent_care', 'specialist'],
        default: 'personal_doctor'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Provider.prototype, "provider_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Provider.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Provider.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Provider.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Provider.prototype, "office_address", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Provider.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Object)
], Provider.prototype, "soft_deleted_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Provider.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Provider.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => visits_model_1.Visit, visit => visit.provider),
    __metadata("design:type", Array)
], Provider.prototype, "visits", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medications_model_1.Medication, medication => medication.prescribing_provider),
    __metadata("design:type", Array)
], Provider.prototype, "medications", void 0);
exports.Provider = Provider = __decorate([
    (0, typeorm_1.Entity)('providers')
], Provider);
//# sourceMappingURL=providers.model.js.map