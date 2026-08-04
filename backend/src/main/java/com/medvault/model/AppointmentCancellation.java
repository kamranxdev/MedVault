package com.medvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_cancellations")
public class AppointmentCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cancelled_by_user_id", nullable = false)
    private User cancelledByUser;

    @Column(name = "cancelled_by_role", nullable = false)
    private String cancelledByRole; // PATIENT, DOCTOR, RECEPTIONIST, ADMIN

    @Column(name = "cancellation_reason", nullable = false)
    private String cancellationReason;

    @Column(name = "additional_comment", length = 500)
    private String additionalComment;

    @Column(name = "cancelled_at", nullable = false)
    private LocalDateTime cancelledAt = LocalDateTime.now();

    @Column(name = "refund_status")
    private String refundStatus = "NOT_APPLICABLE"; // PENDING, PROCESSED, NOT_APPLICABLE

    public AppointmentCancellation() {}

    public AppointmentCancellation(Appointment appointment, User cancelledByUser, String cancelledByRole,
                                   String cancellationReason, String additionalComment, String refundStatus) {
        this.appointment = appointment;
        this.cancelledByUser = cancelledByUser;
        this.cancelledByRole = cancelledByRole;
        this.cancellationReason = cancellationReason;
        this.additionalComment = additionalComment;
        this.refundStatus = refundStatus != null ? refundStatus : "NOT_APPLICABLE";
        this.cancelledAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public User getCancelledByUser() {
        return cancelledByUser;
    }

    public void setCancelledByUser(User cancelledByUser) {
        this.cancelledByUser = cancelledByUser;
    }

    public String getCancelledByRole() {
        return cancelledByRole;
    }

    public void setCancelledByRole(String cancelledByRole) {
        this.cancelledByRole = cancelledByRole;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getAdditionalComment() {
        return additionalComment;
    }

    public void setAdditionalComment(String additionalComment) {
        this.additionalComment = additionalComment;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }
}
