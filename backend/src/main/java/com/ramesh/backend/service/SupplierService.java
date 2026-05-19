package com.ramesh.backend.service;

import com.ramesh.backend.dto.request.SupplierRequest;
import com.ramesh.backend.dto.response.SupplierResponse;
import com.ramesh.backend.entity.Supplier;
import com.ramesh.backend.exception.ResourceNotFoundException;
import com.ramesh.backend.repository.PurchaseOrderRepository;
import com.ramesh.backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Supplier name already exists: " + request.name());
        }
        Supplier supplier = new Supplier();
        supplier.setName(request.name());
        supplier.setContactInfo(request.contactInfo());
        supplier.setAddress(request.address());
        return toResponse(supplierRepository.save(supplier));
    }

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SupplierResponse getSupplierById(String id) {
        return toResponse(findOrThrow(id));
    }

    public SupplierResponse updateSupplier(String id, SupplierRequest request) {
        Supplier supplier = findOrThrow(id);
        if (!supplier.getName().equals(request.name()) && supplierRepository.existsByName(request.name())) {
            throw new IllegalArgumentException("Supplier name already exists: " + request.name());
        }
        supplier.setName(request.name());
        supplier.setContactInfo(request.contactInfo());
        supplier.setAddress(request.address());
        return toResponse(supplierRepository.save(supplier));
    }

    public void deleteSupplier(String id) {
        findOrThrow(id);
        if (purchaseOrderRepository.existsBySupplierId(id)) {
            throw new IllegalArgumentException("Cannot delete supplier with existing purchase orders");
        }
        supplierRepository.deleteById(id);
    }

    private Supplier findOrThrow(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getContactInfo(),
                supplier.getAddress(),
                supplier.getCreatedAt().toString()
        );
    }
}
