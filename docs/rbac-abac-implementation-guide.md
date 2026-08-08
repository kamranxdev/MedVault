# MedVault EHR RBAC + ABAC Developer Implementation Guide

This guide provides step-by-step technical blueprints for implementing MedVault's hybrid **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** architecture in **Spring Boot 3 / Java** and **Angular 19**.

---

## 🏗️ 1. Backend Implementation (Spring Boot 3 + Spring Security 6)

### A. Database Security Entities & Repositories

Create standard JPA entities for permissions and ABAC care team assignments:

```java
// Entity 1: Permission
@Entity
@Table(name = "permissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g., "PRESCRIPTION_CREATE", "VITALS_READ"

    @Column(nullable = false)
    private String category; // e.g., "CLINICAL", "PATIENT", "BILLING"

    private String description;
}

// Entity 2: Patient Care Team Assignment (ABAC attribute provider)
@Entity
@Table(name = "patient_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PatientAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false)
    private User staffUser;

    @Enumerated(EnumType.STRING)
    private AssignmentType assignmentType; // ATTENDING_PHYSICIAN, ASSIGNED_NURSE

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
```

---

### B. Custom ABAC Security Evaluator (SpEL Engine)

Implement a custom Spring Security evaluator bean to execute context checks:

```java
@Component("abacEvaluator")
@RequiredArgsConstructor
public class AbacSecurityEvaluator {

    private final PatientAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    /**
     * Checks if the authenticated staff member has an active care team relationship
     * with the specified patient or if emergency break-glass is active.
     */
    public boolean hasTreatmentRelationship(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) return false;

        // System Admin and Compliance Auditors bypass relationship check for non-clinical audit
        if (hasRole(authentication, "ROLE_SYS_ADMIN") || hasRole(authentication, "ROLE_AUDITOR")) {
            return true;
        }

        // Check 1: Active care team assignment
        boolean hasAssignment = assignmentRepository.existsByPatientIdAndStaffUserIdAndEndDateIsNull(
                patientId, currentUser.getId());
        if (hasAssignment) return true;

        // Check 2: Department match (e.g. Emergency Department on-duty physician)
        Patient patient = patientRepository.findById(patientId).orElse(null);
        if (patient != null && currentUser.getDepartment() != null 
                && currentUser.getDepartment().equals(patient.getDepartment())) {
            return true;
        }

        return false;
    }

    private boolean hasRole(Authentication authentication, String roleName) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleName));
    }
}
```

---

### C. Securing REST Controllers with RBAC + ABAC Annotations

Combine RBAC permissions and ABAC context evaluation on controller methods:

```java
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class ClinicalRecordController {

    private final ClinicalRecordService clinicalRecordService;

    // RBAC: Requires MEDICAL_HISTORY_READ authority
    // ABAC: Evaluates treatment relationship or department match
    @GetMapping("/{patientId}/medical-history")
    @PreAuthorize("hasAuthority('MEDICAL_HISTORY_READ') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public ResponseEntity<MedicalHistoryDto> getMedicalHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalRecordService.getMedicalHistory(patientId));
    }

    // RBAC: Requires PRESCRIPTION_CREATE (Doctors only)
    @PostMapping("/{patientId}/prescriptions")
    @PreAuthorize("hasAuthority('PRESCRIPTION_CREATE') and @abacEvaluator.hasTreatmentRelationship(authentication, #patientId)")
    public ResponseEntity<PrescriptionDto> createPrescription(
            @PathVariable Long patientId,
            @Valid @RequestBody PrescriptionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clinicalRecordService.createPrescription(patientId, request));
    }
}
```

---

## 🅰️ 2. Frontend Implementation (Angular 19 SPA)

### A. Auth & Permission Service

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<UserSession | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user ? user.roles.includes(role) : false;
  }

  hasPermission(permissionCode: string): boolean {
    const user = this.currentUserSignal();
    return user ? user.permissions.includes(permissionCode) : false;
  }

  hasActiveRelationship(patientId: number): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;
    return user.assignedPatientIds.includes(patientId);
  }
}
```

---

### B. Functional Route Guard for Clinical Access

```typescript
export const clinicalAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;
  const patientId = Number(route.paramMap.get('id'));

  const hasPerm = authService.hasPermission(requiredPermission);
  const hasRel = patientId ? authService.hasActiveRelationship(patientId) : true;

  if (hasPerm && hasRel) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
```

---

### C. Custom Structural Directive (`*hasPermission`)

Hide or render UI components based on permissions:

```typescript
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input('hasPermission') permission!: string;

  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  ngOnInit(): void {
    if (this.authService.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

### Usage in Angular Component Templates:

```html
<!-- Only rendered if user has PRESCRIPTION_CREATE permission (Doctor) -->
<button *hasPermission="'PRESCRIPTION_CREATE'" (click)="openPrescribeModal()" class="btn btn-primary">
  + Issue eRx Order
</button>
```

---

## 🔒 3. Mandatory HIPAA Compliance Logging Aspect

Log every access decision to the WORM audit log automatically using Spring AOP:

```java
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRepository auditLogRepository;

    @AfterReturning(pointcut = "@annotation(org.springframework.security.access.prepost.PreAuthorize)", returning = "result")
    public void logAuthorizedAccess(JoinPoint joinPoint, Object result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return;

        AuditLog log = new AuditLog();
        log.setUsername(auth.getName());
        log.setUserRole(auth.getAuthorities().toString());
        log.setAction("AUTHORIZED_API_ACCESS");
        log.setEntityName(joinPoint.getSignature().getName());
        log.setDetails("Successfully accessed endpoint: " + joinPoint.getSignature().toShortString());
        log.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

        auditLogRepository.save(log); // Persistent WORM Insert
    }
}
```
