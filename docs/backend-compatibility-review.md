# Backend compatibility review

Reviewed 2026-10-21 against frontend `a4916ec` (PR #47), backend `d0ceb82`
(including PR #75), and Loyalty service `f8f38f3`. The backend and Loyalty
repositories were read only. The frontend branch is
`fix/frontend-backend-compatibility`. Local `main` and the branch
both point to `a4916ec`.

## Contract matrix

| Domain | Backend contract and frontend result |
| --- | --- |
| Authentication | `POST /auth/login` and `/register`, and `POST /auth/refresh-token` match request and response shapes. JWT `sub`, email, first/last name, and role claim mapping match `TokenService`. Bearer headers and single in-flight refresh remain intact. A 403 is not refreshed. Validation problems can contain top-level `errors`; Axios now reads them. |
| Account | `/account/profile`, profile update, password change, and `/users/me/date-of-birth` match the .NET DTOs and authorization. Date of birth may be null in the profile. The set-once command uses an ISO date string for .NET `DateTime`. |
| Movies and genres | Movie list and deleted list are paginated; detail is a separate DTO. Movie status is numeric. Genre CRUD methods and bodies match. `POST /movies/import` returns HTTP 202 with `message` and `jobId`, not a movie ID; the frontend now treats it as a queued request. |
| Sessions, halls, seats | Session and hall list responses are paginated, details are objects. Session status and seat status are strings. Hall create/update, batch seat type, seat lock, and technology routes match. The current public list adapters request one large page (100 movies/halls, 1000 sessions); completeness beyond those limits is not guaranteed. |
| Booking and orders | Legacy `POST /orders` body matches `CreateOrderRequest` and returns a GUID on confirmed `Paid` success. `POST /orders/checkout-preview` matches the pricing and GOLD preview DTO. Order history returns `{activeOrders,pastOrders}` with string status names. Order and ticket display now retain all known lifecycle states. |
| Ticket admission | `POST /tickets/{id}/validate` returns a JSON string containing the admission result. The frontend now parses that string through Axios. The profile previously called an order ID a ticket ID and encoded that order ID in an external QR; it now displays/copies each valid ticket's actual ID locally. |
| Loyalty and GOLD | `/account/loyalty` and `/account/loyalty/transactions` match the .NET response fields, including nullable expiry dates and transaction order ID. Preview rejection code sets match `CheckoutPreviewReasonCodes`. NestJS Loyalty is reached by the backend over gRPC, not directly by the browser. |
| Admin | Achievements, orders, pricings, sessions, halls, seats, technologies, genres, stats, and Loyalty routes/body shapes match the controllers reviewed. `GET /users` returns a plain list and ignores pagination query parameters; its adapter now uses that shape. Admin order and ticket badges distinguish processing, unknown, expired, reserved, released, and refunded states. |
| SignalR | Host maps `/tickets`; `JoinSessionGroup` and `LeaveSessionGroup` accept a string. Broadcasts target `session:{id}` and send `SeatLocked(sessionId, seatId, userId)` / `SeatUnlocked(sessionId, seatId)`, with GUIDs serialized as strings. The frontend now joins and leaves that actual group while retaining reconnect resynchronization. |

## Confirmed corrections

- The profile mapped `Pending` to cancelled and grouped all other orders by
  session date. It now keeps the backend status, groups only terminal or past
  orders into history, and labels `PaymentProcessing`,
  `PaymentOutcomeUnknown`, `Failed`, `Cancelled`, and `Expired` distinctly.
  Ticket labels keep `Reserved`, `Used`, `Refunded`, and `Released` distinct.
  Admission IDs appear only for future `Paid` orders with `Valid` tickets.
- The ticket hub joined the raw session ID although the notifier broadcasts to
  `session:{id}`. The client now supplies that group name on join, rejoin, and
  leave. Event names and argument order already matched.
- The movie import adapter expected a nonexistent `movieId`. It now returns
  the `message`/`jobId` queue receipt; HTTP 202 is not evidence that the movie
  is already available. Movie DTOs now represent nullable image/actor fields
  and the list response's absent cast correctly.
- The admin users adapter expected a paginated object. It now uses the actual
  plain list. Ticket validation now parses the JSON string response without
  forcing a raw text response.
- Axios error normalization now handles ASP.NET validation errors at the root
  `errors` field as well as its previous extension form.

## Existing behavior and limits

The legacy checkout call remains in place with its existing mock payment token.
The backend orchestrator returns a successful GUID only for an already `Paid`
order or after payment confirmation; failed and unknown payment outcomes are
errors. Therefore the current payment-success screen is reached only for a
confirmed success response. No status polling or two-step checkout was added.
An unknown outcome still requires backend reconciliation; the legacy error
response does not provide an order ID for a targeted status read.

The benefits adapter returns an empty list and the older Loyalty checkout
preview adapter returns an unavailable placeholder. Booking totals use the
real `/orders/checkout-preview` response. The Loyalty service's GOLD reservation,
rollback, and compensation behavior is owned by the backend integration; the
frontend does not claim those placeholders are active services.

The profile no longer requests an external QR image containing an order ID.
It exposes valid ticket IDs for local copy instead. Local QR generation or a
trusted backend admission code remains future work; sending ticket IDs to a
third-party QR endpoint was rejected by automatic approval review because it
would disclose admission identifiers.

## Deferred to Cinema.Payments

- Replace mock tokens and adopt the reservation, checkout, and status flow.
- Provide reliable reconciliation for `PaymentOutcomeUnknown` and an order ID
  on legacy ambiguous failures if that flow remains supported.
- Confirm payment provider refund behavior and GOLD compensation end to end.

## Verification limits

`bun run build` passed. `bun run lint` still reports repository-wide existing
diagnostics; focused lint on changed files reported warnings already present
in those modules and no errors. `git diff --check` passed. No configured test
runner exists. No local backend, database, Loyalty service, payment provider,
or authenticated browser session was available for an end-to-end transaction,
hub event, admin write, or GOLD compensation check. TypeScript compilation
does not verify those runtime flows.
