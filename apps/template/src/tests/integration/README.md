# Integration Tests

This directory contains integration tests for cross-module workflows.

## Status

**Note:** Initial integration test implementation revealed service API mismatches that need to be resolved:

1. **Reports Module**: Services use English names (`balanceSheetService`, `trialBalanceService`, etc.) with `.get()` methods
2. **HR Module**: `departmentsService` and `positionsService` are read-only (only `getAll()` method)
3. **Service Return Types**: Mock responses need to match actual JSON:API response structures

## Recommended Next Steps

1. Review actual service exports and method signatures for each module
2. Update integration tests to match real APIs
3. Consider using real test database or more sophisticated mocking
4. Add integration tests that verify:
   - Cross-module data consistency
   - Complete workflows (e.g., CRM lead → Sales order)
   - Permission-based access control
   - Multi-step processes (e.g., CFDI stamping workflow)

## Current Unit Test Coverage

All modules have comprehensive unit tests with >70% coverage:
- CRM: 83 tests (79.48%+ coverage)
- Reports: 53 tests (73.82%+ coverage)
- HR: 52 tests (82.1%+ coverage)
- Billing/CFDI: 54 tests (84.13%+ coverage)

**Total: 242 unit tests, all passing**
