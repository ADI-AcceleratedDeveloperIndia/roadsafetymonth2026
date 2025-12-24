# Event ID vs Reference ID - Explanation

## Difference Between Event ID and Reference ID

### **Event ID** (e.g., `EVT-001`, `EVT-002`)
- **Purpose**: Unique identifier for the event itself
- **Format**: Sequential number (EVT-001, EVT-002, EVT-003, ...)
- **Generated**: Automatically on event creation
- **Usage**: Internal tracking, database queries, event management
- **Example**: `EVT-001`, `EVT-002`, `EVT-003`

### **Reference ID** (e.g., `KNR-PDL-RHL-EVT-001`)
- **Purpose**: Human-readable reference for certificates, documents, and public display
- **Format**: `KNR-PDL-RHL-{EVENT_ID}`
  - **KNR** = Karimnagar (District code)
  - **PDL** = Padala (RTA Officer code)
  - **RHL** = Rahul (RTA Officer code)
  - **EVT-001** = The Event ID
- **Generated**: Automatically on event creation (includes Event ID)
- **Usage**: Displayed on certificates, shared with participants, used in public-facing documents
- **Example**: `KNR-PDL-RHL-EVT-001`, `KNR-PDL-RHL-EVT-002`

## Example Flow

1. **Event Created** → System generates:
   - Event ID: `EVT-001`
   - Reference ID: `KNR-PDL-RHL-EVT-001`

2. **Event Displayed**:
   - Internal systems use: `EVT-001`
   - Public/certificates show: `KNR-PDL-RHL-EVT-001`

3. **Benefits**:
   - Event ID: Simple, sequential, easy to track
   - Reference ID: Includes location context, makes it clear which district/RTA the event belongs to

## Database Structure

```javascript
{
  _id: ObjectId("..."),           // MongoDB internal ID
  eventId: "EVT-001",             // Unique Event ID
  referenceId: "KNR-PDL-RHL-EVT-001", // Human-readable Reference ID
  title: "Road Safety Rally",
  // ... other fields
}
```

