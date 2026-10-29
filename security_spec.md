# Security Specification & Test Definitions

## 1. Data Invariants
- Each user profile `/users/{userId}` belongs exclusively to `{userId}`.
- All user app ideas `/users/{userId}/ideas/{ideaId}` must have `userId == request.auth.uid` unless viewed/managed by an admin.
- Anonymous writes are denied; users must be authenticated via Firebase Auth.
- Admin status is verified via authenticated email (`mhmmdyusf2286@gmail.com`) or presence in `/admins/{uid}`.
- Global catch-all default deny on all paths not explicitly allowed.

## 2. Dirty Dozen Payloads & Negative Assertions
1. **Unauthenticated Read to `/users/user123`**: Must return `PERMISSION_DENIED`.
2. **Unauthenticated Write to `/users/user123`**: Must return `PERMISSION_DENIED`.
3. **Cross-User Profile Edit**: `userA` attempts to edit `/users/userB`. Must return `PERMISSION_DENIED`.
4. **Cross-User Idea Theft/Read**: `userA` attempts to read `/users/userB/ideas/idea1`. Must return `PERMISSION_DENIED`.
5. **Cross-User Idea Injection**: `userA` attempts to create doc at `/users/userB/ideas/idea1`. Must return `PERMISSION_DENIED`.
6. **Forged UserId in Payload**: `userA` posts to `/users/userA/ideas/idea1` with `userId: "userB"`. Must return `PERMISSION_DENIED`.
7. **Privilege Escalation**: Non-admin user tries to write into `/admins/userA`. Must return `PERMISSION_DENIED`.
8. **Catch-All Subcollection Breach**: Attempt to read/write random `/system_internal/secrets`. Must return `PERMISSION_DENIED`.
9. **Junk Path ID Attack**: Document ID length > 128 chars. Must return `PERMISSION_DENIED`.
10. **Unauthenticated List on Ideas Collection**: Must return `PERMISSION_DENIED`.
11. **Malicious Delete**: `userA` attempts to delete `/users/userB/ideas/idea1`. Must return `PERMISSION_DENIED`.
12. **Non-Owner Profile Overwrite**: Malicious user attempts to replace another user's display name or role. Must return `PERMISSION_DENIED`.
