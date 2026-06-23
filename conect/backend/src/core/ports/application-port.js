// src/core/ports/application-port.js
export class ApplicationPort {
  async create(studentId, opportunityId) { throw new Error('Not implemented'); }
  async delete(studentId, opportunityId) { throw new Error('Not implemented'); }
  async findByStudentId(studentId) { throw new Error('Not implemented'); }
  async findByCompanyId(companyId) { throw new Error('Not implemented'); }
  async updateStatusByStudentAndCompany(studentId, companyId, status) { throw new Error('Not implemented'); }
}
