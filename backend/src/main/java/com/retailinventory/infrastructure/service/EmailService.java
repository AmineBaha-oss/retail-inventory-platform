package com.retailinventory.infrastructure.service;

import com.retailinventory.domain.entity.PurchaseOrder;
import com.retailinventory.domain.entity.Supplier;
import com.retailinventory.domain.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

/**
 * Service for sending emails.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SupplierRepository supplierRepository;

    @Value("${app.email.from:noreply@retailinventory.com}")
    private String fromEmail;

    @Value("${app.email.admin:admin@retailinventory.com}")
    private String adminEmail;

    /**
     * Send purchase order PDF via email.
     */
    public void sendPurchaseOrderEmail(PurchaseOrder purchaseOrder, byte[] pdfContent, String filename) {
        try {
            Supplier supplier = supplierRepository.findById(purchaseOrder.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(supplier.getContactEmail());
            helper.setCc(adminEmail);
            helper.setSubject("Purchase Order: " + purchaseOrder.getPoNumber());
            
            String emailBody = buildPurchaseOrderEmailBody(purchaseOrder, supplier);
            helper.setText(emailBody, true);
            
            helper.addAttachment(filename, new ByteArrayResource(pdfContent));

            mailSender.send(message);
            log.info("Purchase order email sent successfully for PO: {}", purchaseOrder.getPoNumber());

        } catch (MessagingException e) {
            log.error("Error sending purchase order email for PO: {}", purchaseOrder.getPoNumber(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Send low stock alert email.
     */
    public void sendLowStockAlert(String storeName, List<String> lowStockItems) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("Low Stock Alert - " + storeName);
            
            StringBuilder body = new StringBuilder();
            body.append("Low Stock Alert for Store: ").append(storeName).append("\n\n");
            body.append("The following items are running low on stock:\n\n");
            
            for (String item : lowStockItems) {
                body.append("- ").append(item).append("\n");
            }
            
            body.append("\nPlease review and create purchase orders as needed.\n");
            body.append("\nBest regards,\nRetail Inventory Platform");
            
            message.setText(body.toString());
            mailSender.send(message);
            
            log.info("Low stock alert email sent for store: {}", storeName);

        } catch (Exception e) {
            log.error("Error sending low stock alert email for store: {}", storeName, e);
        }
    }

    /**
     * Send purchase order approval request email.
     */
    public void sendApprovalRequestEmail(PurchaseOrder purchaseOrder, String approverEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(approverEmail);
            message.setSubject("Purchase Order Approval Required: " + purchaseOrder.getPoNumber());
            
            String body = buildApprovalRequestEmailBody(purchaseOrder);
            message.setText(body);
            
            mailSender.send(message);
            log.info("Approval request email sent for PO: {}", purchaseOrder.getPoNumber());

        } catch (Exception e) {
            log.error("Error sending approval request email for PO: {}", purchaseOrder.getPoNumber(), e);
        }
    }

    private String buildPurchaseOrderEmailBody(PurchaseOrder purchaseOrder, Supplier supplier) {
        return String.format("""
            <html>
            <body>
                <h2>Purchase Order: %s</h2>
                <p>Dear %s,</p>
                <p>Please find attached the purchase order for your review and processing.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                    <li>PO Number: %s</li>
                    <li>Order Date: %s</li>
                    <li>Expected Delivery: %s</li>
                    <li>Total Amount: $%.2f</li>
                </ul>
                <p>Please confirm receipt and provide an estimated delivery date.</p>
                <p>If you have any questions, please contact us at %s</p>
                <p>Best regards,<br>Retail Inventory Platform</p>
            </body>
            </html>
            """,
            purchaseOrder.getPoNumber(),
            supplier.getName(),
            purchaseOrder.getPoNumber(),
            purchaseOrder.getOrderDate(),
            purchaseOrder.getExpectedDeliveryDate(),
            purchaseOrder.getTotalAmount().doubleValue(),
            adminEmail
        );
    }

    private String buildApprovalRequestEmailBody(PurchaseOrder purchaseOrder) {
        return String.format("""
            Purchase Order Approval Required
            
            PO Number: %s
            Order Date: %s
            Total Amount: $%.2f
            Created By: %s
            
            Please review and approve this purchase order at your earliest convenience.
            
            You can approve or reject this order through the Retail Inventory Platform.
            
            Best regards,
            Retail Inventory Platform
            """,
            purchaseOrder.getPoNumber(),
            purchaseOrder.getOrderDate(),
            purchaseOrder.getTotalAmount().doubleValue(),
            purchaseOrder.getCreatedBy()
        );
    }
}
