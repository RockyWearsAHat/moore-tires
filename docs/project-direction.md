# Moore Tires — Current Product Direction

## Summary
Moore Tires is primarily evolving into a wholesale tire distribution and account-management platform, not just a consumer tire-service app. The main goal is to let business customers place recurring orders through a structured portal instead of relying on phone calls for every order.

The product should support customer-specific pricing, ordering by tire size, billing, inventory-aware workflows, delivery expectations, and company account structures. Direct service and appointment booking still exist, but they are now secondary to the distributor workflow.

## Primary Product Positioning
- B2B ordering platform for Moore Tire as a distributor
- Account-management system for repeat wholesale buyers
- Optional direct service and appointment flow for non-wholesale customers

## Core Business Model Confirmed
Moore Tire operates more like a distributor with inventory, warehouse operations, employees, and at least two fulfillment endpoints. Seattle should be treated as the default fulfillment origin for now, even though Florida is also part of the operating footprint.

The main business objective is to reduce phone-based ordering and move repeat purchasing into a structured portal for chain and commercial customers.

## Confirmed Product Requirements

### Wholesale Ordering
- Customers begin by selecting tire size, which determines available product choices
- Pricing is not flat; it must be configurable per customer, tier, or account agreement
- The system should support wholesale ordering for repeat business customers

### Billing And Checkout
- Billing and payment processing are required capabilities
- Checkout should display delivery timing estimates
- Delivery estimates should initially use Seattle as the source location

### Inventory Workflows
- Customers or stores should be able to upload or manage inventory data
- The platform should notify customers when stock is running low
- Reorder workflows should be supported from those low-inventory states

### Account Structure
- District managers should have accounts
- Stores should report to or be linked under district managers
- The district manager appears to be the main buyer for the locations they oversee
- Store employees should have their own login access for inventory and ordering activity

### Signup Model
- Signup should exist generally
- Larger-volume buyers, especially those ordering more than 50 tires, are a priority audience for onboarding

## Customer And Market Direction
The platform is intended for commercial and chain buyers such as TA truck stops, Love's Truck Stop, and similar large accounts. TA was identified as an early anchor target, with around 50 locations and multiple district managers.

This implies the product must handle multi-location customer relationships, repeat ordering, account-specific pricing, and role-based access across buyer organizations.

## Service Flow Status
Appointments and service work are still part of the business, and the conversation confirmed support for both service and distributor workflows. However, the app is mainly intended to serve Moore Tire in its role as the inventory-holding distributor. Service-booking should therefore be treated as a secondary flow rather than the primary product identity.

## Salvage Scope Clarification
- Salvage activity should not be presented as a customer-facing offer in the app or website.
- Salvage or junk-tire handling appears to be an operational/back-channel process, not a productized sales flow.
- Current product scope should treat inventory as regular manufacturer-supplied offerings unless explicitly clarified otherwise.

## Known Initial Tire Sizes
- 11r24.5
- 11r22.5
- LP 24.5
- LP 22.5
- 445/50 r22.5
- 10.00-20
- 255/70 r22.5

## Open Questions
- Whether stores place orders directly or route requests through district managers
- How visible the service-booking flow should remain in the product
- How fulfillment logic should expand once Florida inventory is modeled fully
- Whether inventory upload starts as manual entry, file import, or live tracking