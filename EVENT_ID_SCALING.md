# Event ID Format - Fixed 5 Digits

## Event ID Format

The Event ID system uses a **fixed 5-digit format** for consistency:

### Format:
- **Always 5 digits**: `EVT-00001`, `EVT-00002`, ..., `EVT-10000`
- **Consistent**: Same format from first event to 10,000th event
- **Easy to read**: Always the same length, easy to sort and search

### Reference ID Format:
- **Format**: `KRMR-RSM-2026-PDL-RHL-EVT-00001`
  - **KRMR** = Karimnagar (District)
  - **RSM** = Road Safety Month
  - **2026** = Year (hardcoded)
  - **PDL** = Padala (RTA Officer)
  - **RHL** = Rahul (RTA Officer)
  - **EVT-00001** = Event ID

## How It Works

1. **Event Count**: System counts total events in database
2. **Next Number**: Adds 1 to get the next event number
3. **Fixed Padding**: Always pads to 5 digits with leading zeros
4. **Reference ID**: Includes district, year, RTA officers, and event ID

## Examples

| Event # | Event ID | Reference ID |
|---------|----------|--------------|
| 1 | `EVT-00001` | `KRMR-RSM-2026-PDL-RHL-EVT-00001` |
| 10 | `EVT-00010` | `KRMR-RSM-2026-PDL-RHL-EVT-00010` |
| 100 | `EVT-00100` | `KRMR-RSM-2026-PDL-RHL-EVT-00100` |
| 999 | `EVT-00999` | `KRMR-RSM-2026-PDL-RHL-EVT-00999` |
| 1000 | `EVT-01000` | `KRMR-RSM-2026-PDL-RHL-EVT-01000` |
| 10000 | `EVT-10000` | `KRMR-RSM-2026-PDL-RHL-EVT-10000` |

## Benefits

✅ **Consistent Format**: Always 5 digits, easy to read and sort
✅ **Up to 10,000 Events**: Handles large-scale event management
✅ **Complete Context**: Reference ID includes district, year, RTA officers
✅ **Professional**: Comprehensive format for official certificates

