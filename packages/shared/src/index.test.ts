/**
 * Shared package tests — Zod schema validation and pure utility functions.
 *
 * Naming convention: UnitUnderTest_Scenario_ExpectedOutcome
 */
import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  ScheduleJobSchema,
  UpdateJobStatusSchema,
  ReassignJobSchema,
  CreateServiceRequestSchema,
  CreateTireProductSchema,
  TireProductSearchSchema,
  CreateOrderSchema,
  InviteUserSchema,
  CreateWholesaleAccountSchema,
  InventoryItemSchema,
  JOB_STATUS_TRANSITIONS,
  calculateTierPrice,
  type JobStatus,
} from './index.js';

// ─── RegisterSchema ───────────────────────────────────────────────────────────

describe('RegisterSchema', () => {
  it('Register_ValidInput_ParsesSuccessfully', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'SecurePass1',
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(result.success).toBe(true);
  });

  it('Register_ShortPassword_FailsValidation', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'short',
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it('Register_InvalidEmail_FailsValidation', () => {
    const result = RegisterSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePass1',
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(result.success).toBe(false);
  });

  it('Register_MissingFirstName_FailsValidation', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'SecurePass1',
      lastName: 'Smith',
    });
    expect(result.success).toBe(false);
  });

  it('Register_ValidE164Phone_ParsesSuccessfully', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'SecurePass1',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+15558675309',
    });
    expect(result.success).toBe(true);
  });

  it('Register_InvalidPhoneFormat_FailsValidation', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'SecurePass1',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-867-5309', // not E.164
    });
    expect(result.success).toBe(false);
  });

  it('Register_PasswordTooLong_FailsValidation', () => {
    const result = RegisterSchema.safeParse({
      email: 'jane@example.com',
      password: 'a'.repeat(129),
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(result.success).toBe(false);
  });
});

// ─── LoginSchema ──────────────────────────────────────────────────────────────

describe('LoginSchema', () => {
  it('Login_ValidCredentials_ParsesSuccessfully', () => {
    const result = LoginSchema.safeParse({ email: 'admin@example.com', password: 'pass' });
    expect(result.success).toBe(true);
  });

  it('Login_EmptyPassword_FailsValidation', () => {
    const result = LoginSchema.safeParse({ email: 'admin@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('Login_MissingEmail_FailsValidation', () => {
    const result = LoginSchema.safeParse({ password: 'pass' });
    expect(result.success).toBe(false);
  });
});

// ─── ScheduleJobSchema ────────────────────────────────────────────────────────

describe('ScheduleJobSchema', () => {
  const validBase = {
    serviceRequestId: 'sr_123',
    technicianId: 'tech_456',
    startsAt: '2025-06-01T09:00:00.000Z',
    endsAt: '2025-06-01T10:00:00.000Z',
  };

  it('ScheduleJob_ValidInput_ParsesSuccessfully', () => {
    expect(ScheduleJobSchema.safeParse(validBase).success).toBe(true);
  });

  it('ScheduleJob_MissingTechnicianId_FailsValidation', () => {
    const { technicianId: _technicianId, ...rest } = validBase;
    void _technicianId;
    expect(ScheduleJobSchema.safeParse(rest).success).toBe(false);
  });

  it('ScheduleJob_NonIsoDatetime_FailsValidation', () => {
    expect(
      ScheduleJobSchema.safeParse({ ...validBase, startsAt: '2025-06-01' }).success
    ).toBe(false);
  });

  it('ScheduleJob_EmptyServiceRequestId_FailsValidation', () => {
    expect(
      ScheduleJobSchema.safeParse({ ...validBase, serviceRequestId: '' }).success
    ).toBe(false);
  });
});

// ─── UpdateJobStatusSchema ────────────────────────────────────────────────────

describe('UpdateJobStatusSchema', () => {
  it('UpdateJobStatus_ValidStatus_ParsesSuccessfully', () => {
    expect(UpdateJobStatusSchema.safeParse({ status: 'EN_ROUTE' }).success).toBe(true);
  });

  it('UpdateJobStatus_InvalidStatus_FailsValidation', () => {
    expect(UpdateJobStatusSchema.safeParse({ status: 'FLYING' }).success).toBe(false);
  });

  it('UpdateJobStatus_NotesTooLong_FailsValidation', () => {
    expect(
      UpdateJobStatusSchema.safeParse({ status: 'COMPLETE', notes: 'x'.repeat(1001) }).success
    ).toBe(false);
  });

  it('UpdateJobStatus_OptionalNotes_ParsesSuccessfully', () => {
    const result = UpdateJobStatusSchema.safeParse({ status: 'COMPLETE', notes: 'All done.' });
    expect(result.success).toBe(true);
  });
});

// ─── ReassignJobSchema ────────────────────────────────────────────────────────

describe('ReassignJobSchema', () => {
  it('ReassignJob_TechnicianIdOnly_ParsesSuccessfully', () => {
    expect(ReassignJobSchema.safeParse({ technicianId: 'tech_789' }).success).toBe(true);
  });

  it('ReassignJob_EmptyTechnicianId_FailsValidation', () => {
    expect(ReassignJobSchema.safeParse({ technicianId: '' }).success).toBe(false);
  });

  it('ReassignJob_WithValidDatetimes_ParsesSuccessfully', () => {
    expect(
      ReassignJobSchema.safeParse({
        technicianId: 'tech_789',
        startsAt: '2025-06-01T14:00:00.000Z',
        endsAt: '2025-06-01T15:00:00.000Z',
      }).success
    ).toBe(true);
  });
});

// ─── JOB_STATUS_TRANSITIONS (state machine) ───────────────────────────────────

describe('JOB_STATUS_TRANSITIONS', () => {
  it('StatusMachine_ScheduledCanTransitionToEnRoute', () => {
    expect(JOB_STATUS_TRANSITIONS.SCHEDULED).toContain('EN_ROUTE');
  });

  it('StatusMachine_ScheduledCanTransitionToCancelled', () => {
    expect(JOB_STATUS_TRANSITIONS.SCHEDULED).toContain('CANCELLED');
  });

  it('StatusMachine_EnRouteCantGoBackToScheduled', () => {
    expect(JOB_STATUS_TRANSITIONS.EN_ROUTE).not.toContain('SCHEDULED');
  });

  it('StatusMachine_CompleteHasNoTransitions', () => {
    expect(JOB_STATUS_TRANSITIONS.COMPLETE).toHaveLength(0);
  });

  it('StatusMachine_CancelledHasNoTransitions', () => {
    expect(JOB_STATUS_TRANSITIONS.CANCELLED).toHaveLength(0);
  });

  it('StatusMachine_InProgressCanCompleteOrCancel', () => {
    const transitions = JOB_STATUS_TRANSITIONS.IN_PROGRESS;
    expect(transitions).toContain('COMPLETE');
    expect(transitions).toContain('CANCELLED');
  });

  it('StatusMachine_AllStatusesArePresentAsKeys', () => {
    const statuses: JobStatus[] = ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];
    for (const s of statuses) {
      expect(JOB_STATUS_TRANSITIONS[s]).toBeDefined();
    }
  });
});

// ─── calculateTierPrice ───────────────────────────────────────────────────────

describe('calculateTierPrice', () => {
  it('TierPrice_NoDiscount_ReturnsBasePrice', () => {
    expect(calculateTierPrice(100, 0)).toBe(100);
  });

  it('TierPrice_TenPercentDiscount_ReturnsNinetyDollars', () => {
    expect(calculateTierPrice(100, 10)).toBe(90);
  });

  it('TierPrice_FifteenPointFivePercent_RoundsToTwoCents', () => {
    // 200 * (1 - 0.155) = 200 * 0.845 = 169.00
    expect(calculateTierPrice(200, 15.5)).toBe(169);
  });

  it('TierPrice_OverrideProvidedZero_ReturnsZero', () => {
    expect(calculateTierPrice(100, 20, 0)).toBe(0);
  });

  it('TierPrice_OverrideProvided_IgnoresDiscount', () => {
    // Override should take precedence over any discount
    expect(calculateTierPrice(100, 20, 75)).toBe(75);
  });

  it('TierPrice_FullHundredPercentDiscount_ReturnsZero', () => {
    expect(calculateTierPrice(100, 100)).toBe(0);
  });

  it('TierPrice_FractionalBase_RoundsToCents', () => {
    // 10.99 * (1 - 0.10) = 9.891 → rounds to 9.89
    expect(calculateTierPrice(10.99, 10)).toBe(9.89);
  });
});

// ─── CreateServiceRequestSchema ───────────────────────────────────────────────

describe('CreateServiceRequestSchema', () => {
  const validRequest = {
    fullName: 'John Doe',
    phone: '+15558675309',
    vehicleYear: 2020,
    vehicleMake: 'Peterbilt',
    vehicleModel: '389',
    licensePlate: 'ABC1234',
    serviceType: 'INSTALL',
    preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferredTimeWindow: 'MORNING',
  };

  it('ServiceRequest_ValidInput_ParsesSuccessfully', () => {
    expect(CreateServiceRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it('ServiceRequest_PastDate_FailsValidation', () => {
    const result = CreateServiceRequestSchema.safeParse({
      ...validRequest,
      preferredDate: '2020-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('ServiceRequest_InvalidServiceType_FailsValidation', () => {
    expect(
      CreateServiceRequestSchema.safeParse({ ...validRequest, serviceType: 'WASH' }).success
    ).toBe(false);
  });

  it('ServiceRequest_LicensePlateUppercased_TransformApplied', () => {
    const result = CreateServiceRequestSchema.safeParse({
      ...validRequest,
      licensePlate: 'abc1234',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.licensePlate).toBe('ABC1234');
  });

  it('ServiceRequest_NotesTooLong_FailsValidation', () => {
    expect(
      CreateServiceRequestSchema.safeParse({ ...validRequest, notes: 'x'.repeat(501) }).success
    ).toBe(false);
  });

  it('ServiceRequest_MobileServiceDefault_IsFalse', () => {
    const result = CreateServiceRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isMobileService).toBe(false);
  });
});

// ─── CreateTireProductSchema ──────────────────────────────────────────────────

describe('CreateTireProductSchema', () => {
  const validProduct = {
    brand: 'Bridgestone',
    tireModel: 'R283A',
    size: { width: 11, aspectRatio: 0, rimDiameter: 24.5, construction: 'R' },
    formattedSize: '11R24.5',
    type: 'COMMERCIAL',
    loadIndex: 'G',
    speedRating: 'J',
    baseRetailPrice: 349.99,
  };

  it('TireProduct_ValidInput_ParsesSuccessfully', () => {
    expect(CreateTireProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it('TireProduct_NegativePrice_FailsValidation', () => {
    expect(
      CreateTireProductSchema.safeParse({ ...validProduct, baseRetailPrice: -1 }).success
    ).toBe(false);
  });

  it('TireProduct_EmptyBrand_FailsValidation', () => {
    expect(
      CreateTireProductSchema.safeParse({ ...validProduct, brand: '' }).success
    ).toBe(false);
  });

  it('TireProduct_InvalidType_FailsValidation', () => {
    expect(
      CreateTireProductSchema.safeParse({ ...validProduct, type: 'RACE' }).success
    ).toBe(false);
  });

  it('TireProduct_ImagesDefaultsToEmptyArray', () => {
    const result = CreateTireProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.images).toEqual([]);
  });
});

// ─── TireProductSearchSchema ──────────────────────────────────────────────────

describe('TireProductSearchSchema', () => {
  it('Search_EmptyInput_UsesDefaults', () => {
    const result = TireProductSearchSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('Search_PageAsString_CoercedToNumber', () => {
    const result = TireProductSearchSchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });

  it('Search_LimitOverMax_FailsValidation', () => {
    expect(TireProductSearchSchema.safeParse({ limit: '200' }).success).toBe(false);
  });

  it('Search_NegativePage_FailsValidation', () => {
    expect(TireProductSearchSchema.safeParse({ page: '0' }).success).toBe(false);
  });
});

// ─── InviteUserSchema ─────────────────────────────────────────────────────────

describe('InviteUserSchema', () => {
  it('InviteUser_DistrictManagerWithoutAccountId_FailsValidation', () => {
    const result = InviteUserSchema.safeParse({
      email: 'manager@example.com',
      firstName: 'Bob',
      lastName: 'Manager',
      role: 'district_manager',
    });
    expect(result.success).toBe(false);
  });

  it('InviteUser_DistrictManagerWithAccountId_ParsesSuccessfully', () => {
    const result = InviteUserSchema.safeParse({
      email: 'manager@example.com',
      firstName: 'Bob',
      lastName: 'Manager',
      role: 'district_manager',
      wholesaleAccountId: 'wa_123',
    });
    expect(result.success).toBe(true);
  });

  it('InviteUser_StoreEmployeeWithoutLocationId_FailsValidation', () => {
    const result = InviteUserSchema.safeParse({
      email: 'emp@example.com',
      firstName: 'Alice',
      lastName: 'Employee',
      role: 'store_employee',
      wholesaleAccountId: 'wa_123',
    });
    expect(result.success).toBe(false);
  });

  it('InviteUser_RetailCustomer_ParsesSuccessfully', () => {
    const result = InviteUserSchema.safeParse({
      email: 'retail@example.com',
      firstName: 'Carl',
      lastName: 'Customer',
      role: 'retail_customer',
    });
    expect(result.success).toBe(true);
  });
});

// ─── CreateWholesaleAccountSchema ─────────────────────────────────────────────

describe('CreateWholesaleAccountSchema', () => {
  const validAccount = {
    companyName: 'Acme Trucking',
    contactEmail: 'billing@acme.test',
    contactPhone: '+15558675309',
    billingAddress: {
      street: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
    },
  };

  it('WholesaleAccount_ValidInput_ParsesSuccessfully', () => {
    expect(CreateWholesaleAccountSchema.safeParse(validAccount).success).toBe(true);
  });

  it('WholesaleAccount_StateNotTwoChars_FailsValidation', () => {
    expect(
      CreateWholesaleAccountSchema.safeParse({
        ...validAccount,
        billingAddress: { ...validAccount.billingAddress, state: 'Washington' },
      }).success
    ).toBe(false);
  });

  it('WholesaleAccount_InvalidZip_FailsValidation', () => {
    expect(
      CreateWholesaleAccountSchema.safeParse({
        ...validAccount,
        billingAddress: { ...validAccount.billingAddress, zip: '1234' },
      }).success
    ).toBe(false);
  });

  it('WholesaleAccount_NineDigitZip_ParsesSuccessfully', () => {
    expect(
      CreateWholesaleAccountSchema.safeParse({
        ...validAccount,
        billingAddress: { ...validAccount.billingAddress, zip: '98101-2345' },
      }).success
    ).toBe(true);
  });

  it('WholesaleAccount_DefaultsToPrePaid', () => {
    const result = CreateWholesaleAccountSchema.safeParse(validAccount);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.paymentTerms).toBe('PREPAID');
  });
});

// ─── InventoryItemSchema ──────────────────────────────────────────────────────

describe('InventoryItemSchema', () => {
  it('InventoryItem_ValidInput_ParsesSuccessfully', () => {
    const result = InventoryItemSchema.safeParse({
      productId: 'prod_abc',
      currentQuantity: 10,
      reorderThreshold: 3,
      targetQuantity: 20,
    });
    expect(result.success).toBe(true);
  });

  it('InventoryItem_NegativeQuantity_FailsValidation', () => {
    expect(
      InventoryItemSchema.safeParse({
        productId: 'prod_abc',
        currentQuantity: -1,
        reorderThreshold: 3,
        targetQuantity: 20,
      }).success
    ).toBe(false);
  });

  it('InventoryItem_ZeroQuantity_ParsesSuccessfully', () => {
    expect(
      InventoryItemSchema.safeParse({
        productId: 'prod_abc',
        currentQuantity: 0,
        reorderThreshold: 0,
        targetQuantity: 0,
      }).success
    ).toBe(true);
  });

  it('InventoryItem_AutoReorderDefaultsFalse', () => {
    const result = InventoryItemSchema.safeParse({
      productId: 'prod_abc',
      currentQuantity: 5,
      reorderThreshold: 2,
      targetQuantity: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.autoReorder).toBe(false);
  });
});

// ─── CreateOrderSchema ────────────────────────────────────────────────────────

describe('CreateOrderSchema', () => {
  const validOrder = {
    items: [{ productId: 'prod_1', quantity: 2 }],
    shippingAddress: {
      street: '456 Freight Way',
      city: 'Tacoma',
      state: 'WA',
      zip: '98402',
    },
  };

  it('CreateOrder_ValidInput_ParsesSuccessfully', () => {
    expect(CreateOrderSchema.safeParse(validOrder).success).toBe(true);
  });

  it('CreateOrder_EmptyItemsList_FailsValidation', () => {
    expect(CreateOrderSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
  });

  it('CreateOrder_ZeroQuantity_FailsValidation', () => {
    expect(
      CreateOrderSchema.safeParse({
        ...validOrder,
        items: [{ productId: 'prod_1', quantity: 0 }],
      }).success
    ).toBe(false);
  });

  it('CreateOrder_DefaultPaymentMethod_IsCard', () => {
    const result = CreateOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.paymentMethod).toBe('CARD');
  });
});
