# Phase 7 review screenshots

All account captures use disposable Playwright fixtures with synthetic personal
details, ticket IDs and QR values. No real admission QR or account was captured.
See [the report](../../phase-7.md) and [raw checks](../../phase-7-browser-results.json).

## Before / after

| Surface | Before | After |
| --- | --- | --- |
| Tickets, desktop | [1440px](before-tickets-1440.png) | [1440px](after-tickets-reduce-1440.png) |
| Tickets, tablet | [768px](before-tickets-768.png) | [768px](after-tickets-reduce-768.png) |
| Tickets, phone | [390px](before-tickets-390.png) | [390px](after-tickets-reduce-390.png) |
| Tickets, narrow phone | [320px](before-tickets-320.png) | [320px](after-tickets-reduce-320.png) |
| Settings, desktop | [1440px](before-settings-1440.png) | [1440px](settings-reduce-1440.png) |
| Settings, phone | [390px](before-settings-390.png) | [390px](settings-reduce-390.png) |

## First viewport

| Motion | Desktop | Tablet | Phone | Narrow phone |
| --- | --- | --- | --- | --- |
| Reduced | [1440](viewport-reduce-1440.png) | [768](viewport-reduce-768.png) | [390](viewport-reduce-390.png) | [320](viewport-reduce-320.png) |
| Normal | [1440](viewport-no-preference-1440.png) | [768](viewport-no-preference-768.png) | [390](viewport-no-preference-390.png) | [320](viewport-no-preference-320.png) |

## Interaction and request states

- [Two valid QRs and a refunded seat, desktop](qr-reduce-1440.png)
- [Expanded tickets, narrow phone](qr-reduce-320.png)
- [Single paid ticket and its QR](single-ticket-1440.png)
- [History with failed, expired, cancelled and used tickets](history-reduce-390.png)
- [Achievement preview](achievements-reduce-390.png)
- [Validation errors](validation-reduce-390.png)
- [Profile/password save feedback, empty password fields](settings-saved-1440.png)
- [One-time birth-date save and locked field](birth-date-saved-1440.png)
- [Keyboard focus in settings](keyboard-settings-1440.png)
- [Loading](loading-390.png)
- [Empty tickets and zero loyalty balance](empty-390.png)
- [Empty achievements](empty-achievements-390.png)
- [Orders/profile unavailable](error-390.png)
- [Loyalty unavailable while tickets remain visible](loyalty-error-390.png)
- [Achievements unavailable](achievements-error-390.png)

## Enlarged text

Account-only captures show the contained surface, including the corrected native
date field. Whole-page captures also show the existing shared Header/Footer
overflow documented in Phase 6. These are 200% root-font checks, not a complete
browser-zoom certification. The fixed Header is temporarily hidden only while
taking the Account-only capture, to prevent its overlay obscuring the surface.
The saved birth date also has a full, wrapping text hint when the native field
truncates its value at large text sizes.

| Width | Account | Whole page |
| --- | --- | --- |
| 1440 | [Settings](text-200-settings-1440-account.png) | [Page](text-200-settings-1440.png) |
| 768 | [Settings](text-200-settings-768-account.png) | [Page](text-200-settings-768.png) |
| 390 | [Settings](text-200-settings-390-account.png) | [Page](text-200-settings-390.png) |
| 320 | [Settings](text-200-settings-320-account.png) | [Page](text-200-settings-320.png) |

[Concept](concept.png), [A24 reference](reference-a24-1440.png),
[Siena reference](reference-siena-1440.png). Reference pages are public sites;
the concept is a study with intentional differences documented in the report.
